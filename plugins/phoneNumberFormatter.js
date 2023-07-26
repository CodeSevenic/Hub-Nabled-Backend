const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');
const { parsePhoneNumberFromString } = require('libphonenumber-js'); // Use this line instead
const { getSelectedCountry } = require('../firebase/firebaseAdmin');

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

async function formatContact(id, phoneNumber, countryCode, accessToken, hubspotId) {
  const newPhoneNumber = phoneNumber;
  const newCountryCode = countryCode;

  async function checkCountryCode(newCountryCode) {
    try {
      const selectedCountryCode = await getSelectedCountry(hubspotId);

      if (selectedCountryCode) {
        return selectedCountryCode;
      } else if (newCountryCode) {
        return newCountryCode.toUpperCase();
      } else {
        return 'ZA';
      }
    } catch (error) {
      console.error('Error:', error.message);
      return 'ZA';
    }
  }

  async function formatPhoneNumber() {
    if (newPhoneNumber) {
      if (newPhoneNumber.startsWith('+')) {
        return newPhoneNumber;
      }

      const countryCode = await checkCountryCode(newCountryCode);
      const number = phoneUtil.parseAndKeepRawInput(newPhoneNumber, countryCode);
      const countryCodeValue = number.values_['1'];
      const actualNumberValue = number.values_['2'];
      const newNumber = `+${countryCodeValue}${actualNumberValue}`;
      return newNumber;
    }
  }

  try {
    const formattedPhoneNumber = await formatPhoneNumber();
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          phone: formattedPhoneNumber,
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
    console.log('No Phone Number to update. Skipping...');
  }
}

async function fetchContact(id, accessToken) {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let url = `https://api.hubapi.com/crm/v3/objects/contacts/${id}?properties=phone,ip_country_code`;

    const { data } = await axios.get(url, { headers });
    const phoneNumber = data.properties.phone;
    const countryCode = data.properties.ip_country_code;

    return { phoneNumber, countryCode };
  } catch (error) {
    console.error('Failed to retrieve contacts: ', error.message);
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

        const contactId = event.objectId;

        console.log('All variables: ', contactId, phoneNumber, countryCode);

        await formatContact(contactId, phoneNumber, countryCode, accessToken, portalId);
      }
    } else {
      const allContacts = await fetchAllContacts(accessToken);

      allContacts.forEach((element) => {
        const phoneNumber = element.properties ? element.properties.phone : null;
        const countryCode = element.properties ? element.properties.ip_country_code : null;
        limiter.schedule(() =>
          formatContact(element.id, phoneNumber, countryCode, accessToken, portalId)
        );
      });
    }
  } catch (error) {
    console.log('phoneNumberFormatter error: ', error.message);
  }
};

module.exports = phoneNumberFormatter;
