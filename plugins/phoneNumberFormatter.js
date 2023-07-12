const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');
const { parsePhoneNumberFromString } = require('libphonenumber-js'); // Use this line instead

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

// async function formatPhoneNumber(id, phoneNumber, accessToken, defaultCountry = 'US') {
//   const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, defaultCountry);
//   const newPhoneNumber = parsedPhoneNumber ? parsedPhoneNumber.formatInternational() : null;

//   try {
//     await axios.patch(
//       `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
//       {
//         properties: {
//           phone: newPhoneNumber,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//   } catch (error) {
//     console.error('Failed to update contact: ', error.message);
//   }
// }

async function formatContact(id, firstName, lastName, phoneNumber, countryCode, accessToken) {
  const newName = firstName;
  const newLastName = lastName;
  const newPhoneNumber = phoneNumber;
  const newCountryCode = countryCode;

  function checkFirstName() {
    if (newName == null) {
      return '';
    } else {
      return newName.charAt(0).toUpperCase() + newName.substr(1).toLowerCase();
    }
  }

  function checkLastName() {
    if (newLastName == null) {
      return '';
    } else {
      return newLastName.charAt(0).toUpperCase() + newLastName.substr(1).toLowerCase();
    }
  }

  function checkCountryCode() {
    if (newCountryCode) {
      return newCountryCode.toUpperCase();
    } else {
      return 'ZA';
    }
  }

  function formatPhoneNumber() {
    if (newPhoneNumber) {
      const number = phoneUtil.parseAndKeepRawInput(newPhoneNumber, checkCountryCode());
      const countryCodeValue = number.values_['1'];
      const actualNumberValue = number.values_['2'];
      const newNumber = `+${countryCodeValue}${actualNumberValue}`;
      return newNumber;
    }
  }

  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: checkFirstName(),
          lastname: checkLastName(),
          phone: formatPhoneNumber(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`Contact with ${id} has been updated.`);
  } catch (error) {
    console.log(error);
  }
}

const fetchAllContacts = async (accessToken) => {
  console.log('=== Retrieving all contacts from HubSpot using the access token ===');
  let after = '';
  let allContacts = [];
  let keepGoing = true;

  // Keep making requests until all contacts are retrieved
  while (keepGoing) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      let url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100${
        after ? `&after=${after}` : ''
      }`;

      const { data } = await axios.get(url, { headers });

      // Add the retrieved contacts to the 'allContacts' array
      allContacts = [...allContacts, ...data.results];

      // If there's a next page, prepare to fetch it in the next loop iteration
      if (data.paging && data.paging.next) {
        after = data.paging.next.after;
      } else {
        keepGoing = false;
      }
    } catch (error) {
      console.error('Failed to retrieve contacts: ', error.message);
      keepGoing = false;
    }
  }

  return allContacts;
};

// fetch contact by id abd return the phone number
async function fetchContact(id, accessToken) {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let url = `https://api.hubapi.com/crm/v3/objects/contacts/${id}?properties=phone,ip_country_code,firstname,lastname`;

    const { data } = await axios.get(url, { headers });
    const phoneNumber = data.properties.phone;
    const countryCode = data.properties.ip_country_code;
    const firstName = data.properties.firstname;
    const lastName = data.properties.lastname;

    // console.log('All variables: ', phoneNumber, countryCode, firstName, lastName);

    return { phoneNumber, countryCode, firstName, lastName };
  } catch (error) {
    console.error('Failed to retrieve contacts: ', error.message);
  }
}

const phoneNumberFormatter = async (userId, portalId, req, isWebhook) => {
  console.log('isWebhook', isWebhook);
  const authorized = await isAuthorized(userId, portalId);

  if (!authorized) {
    console.log('User is not authorized.');
    return;
  }

  try {
    const accessToken = await getAccessToken(userId, portalId);

    if (isWebhook == true) {
      const webhooksEvent = req.body;
      for (const event of webhooksEvent) {
        const contact = await fetchContact(event.objectId, accessToken);
        const phoneNumber = contact.phoneNumber;
        const countryCode = contact.countryCode;
        const firstName = contact.firstName;
        const lastName = contact.lastName;

        const contactId = event.objectId;
        // let phoneNumber = null;

        // if (event.propertyName === 'phone') {
        //   phoneNumber = event.propertyValue;
        // }

        console.log('All variables: ', contactId, phoneNumber, countryCode, firstName, lastName);

        await formatContact(contactId, firstName, lastName, phoneNumber, countryCode, accessToken);
      }
    } else {
      // Fetch all contacts with pagination
      const allContacts = await fetchAllContacts(accessToken);

      // Use the rate limiter to update the contacts
      allContacts.forEach((element) => {
        const phoneNumber = element.properties ? element.properties.phone : null;
        const countryCode = element.properties ? element.properties.ip_country_code : null;
        const firstName = element.properties ? element.properties.firstname : null;
        const lastName = element.properties ? element.properties.lastname : null;
        limiter.schedule(() =>
          formatContact(element.id, firstName, lastName, phoneNumber, countryCode, accessToken)
        );
      });
    }
  } catch (error) {
    console.log('phoneNumberFormatter error: ', error.message);
  }
};

module.exports = phoneNumberFormatter;
