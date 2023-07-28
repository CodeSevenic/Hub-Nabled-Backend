const axios = require('axios');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const threeCX = async (userId, portalId, req, isWebhook) => {
  console.log('isWebhook', isWebhook);
  const authorized = await isAuthorized(userId, portalId);

  if (!authorized) {
    console.log('User is not authorized.');
    return;
  }

  try {
    const apiKey = await getAccessToken(userId, portalId);

    if (!apiKey) {
      console.log('API key not found');
      return;
    }

    if (isWebhook == true) {
      const webhooksEvent = req.body;
      for (const event of webhooksEvent) {
        const contactId = event.objectId;

        if (event.subscriptionType == 'contact.creation') {
          try {
            const contactDetails = await axios.get(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
              {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  'content-type': 'application/json',
                },
                params: {
                  properties: 'firstname,lastname,phone,ip_country',
                },
              }
            );

            if (!contactDetails.data || !contactDetails.data.properties) {
              console.log(`No contact details found for contactId: ${contactId}`);
              return;
            }

            console.log('Contact details', contactDetails.data);

            const firstName = contactDetails.data.properties.firstname;
            const lastName = contactDetails.data.properties.lastname;
            const phone = contactDetails.data.properties.phone;

            if (firstName == 'New' && lastName.includes('Contact')) {
              setTimeout(function () {
                console.log(`You now have 30 seconds to create an Egagment!`);
              }, 1000);
            }

            let engagementId;

            setTimeout(async () => {
              const engagmentDetails = await axios.get(
                `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/engagement`,
                {
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'content-type': 'application/json',
                  },
                }
              );

              if (
                !engagmentDetails.data ||
                !engagmentDetails.data.results ||
                !engagmentDetails.data.results[0]
              ) {
                console.log(`No engagement details found for contactId: ${contactId}`);
                return;
              }

              console.log('Engagment Details', engagmentDetails.data);
              engagementId = engagmentDetails.data.results[0].id;

              formatPhoneNumber(phone);

              function formatPhoneNumber(phone) {
                if (phone) {
                  const number = phoneUtil.parseAndKeepRawInput(phone, 'ZA');
                  const countryCode = number.values_['1'];
                  const actualNumber = number.values_['2'];
                  const newNumber = `+${countryCode}${actualNumber}`;
                  SearchHubspot(newNumber);
                }
              }

              async function SearchHubspot(formattedPhone) {
                const searchData = await axios.post(
                  `https://api.hubapi.com/crm/v3/objects/contacts/search`,
                  {
                    query: formattedPhone,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${apiKey}`,
                      'content-type': 'application/json',
                    },
                  }
                );

                if (!searchData.data || !searchData.data.results) {
                  console.log(`No search data found for phone: ${formattedPhone}`);
                  return;
                }

                console.log(searchData.data);

                searchData.data.results.forEach(async (element) => {
                  console.log(element.properties);
                  if (contactId != element.id) {
                    const association = await axios.put(
                      `https://api.hubapi.com/crm-associations/v1/associations`,
                      {
                        fromObjectId: element.id,
                        toObjectId: engagementId,
                        category: 'HUBSPOT_DEFINED',
                        definitionId: 9,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${apiKey}`,
                          'content-type': 'application/json',
                        },
                      }
                    );

                    console.log('Associated: ', association);
                    const deletion = await axios.delete(
                      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${apiKey}`,
                        },
                      }
                    );

                    console.log('Deleted: ', deletion);
                  }
                });
              }
            }, 30000);
          } catch (error) {
            console.log('Contact creation error: ', error.message);
          }
        } else {
          console.log('Subscription type is not == contact.creation.');
        }
      }
    }
  } catch (error) {
    console.log('ThreeCX error: ', error.message);
  }
};

module.exports = threeCX;
