const { isAuthorized, getAccessToken } = require('../services/hubspot');

async function createContactsBatch(accessToken, contacts, fieldMappings) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;

  for (let contact of contacts) {
    // Generate properties object based on fieldMappings
    const properties = {};
    for (let mapping of fieldMappings) {
      properties[mapping.property] = contact[mapping.column];
    }

    try {
      const response = await axios.post(apiUrl, { properties }, { headers });
      console.log(`Created contact with ID: ${response.data.id}`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.error('A contact with the same ID already exists. Skipping...');
        continue; // Skip this contact and move on to the next one
      } else {
        console.error('Error creating contacts:', error);
        throw error; // Re-throw the error for axios-retry to catch and retry
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100)); // Delay next request
  }
}

const runCreateContacts = async (contactsData, fieldMappings, accessToken) => {
  const contactBatches = [];
  for (let i = 0; i < contactsData.length; i += 100) {
    contactBatches.push(contactsData.slice(i, i + 100));
  }

  for (let i = 0; i < contactBatches.length; i++) {
    console.log(`Creating contacts batch ${i + 1}...`);
    await createContactsBatch(accessToken, contactBatches[i], fieldMappings);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Handle rate limiting
  }
};

// app.post('/api/process-data', async (req, res) => {
//   try {
//     const jsonData = req.body.jsonData;
//     const fieldMappings = req.body.fieldMappings;

//     // Remove duplicates based on email property
//     const uniqueEmails = Array.from(
//       new Set(
//         jsonData.map((a) => a[fieldMappings.find((mapping) => mapping.property === 'email').column])
//       )
//     );

//     const contactsData = uniqueEmails.map((email) =>
//       jsonData.find(
//         (a) => a[fieldMappings.find((mapping) => mapping.property === 'email').column] === email
//       )
//     );

//     await runCreateContacts(contactsData, fieldMappings);

//     res.status(200).send({ message: 'Data processed successfully' });
//   } catch (error) {
//     console.error('Error processing data:', error);
//     res.status(500).send({ message: 'Error processing data' });
//   }
// });

const dataUploader = async (userId, portalId, request) => {
  console.log('userId: ', userId + ' portalId: ', portalId);
  const jsonData = request.body.jsonData;
  const fieldMappings = request.body.fieldMappings;

  console.log('jsonData: ', jsonData);
  console.log('fieldMappings: ', fieldMappings);

  // try {
  //   const authorized = await isAuthorized(userId, portalId);
  //   if (authorized) {
  //     const accessToken = await getAccessToken(userId, portalId);

  //     // Remove duplicates based on email property
  //     const uniqueEmails = Array.from(
  //       new Set(
  //         jsonData.map(
  //           (a) => a[fieldMappings.find((mapping) => mapping.property === 'email').column]
  //         )
  //       )
  //     );

  //     const contactsData = uniqueEmails.map((email) =>
  //       jsonData.find(
  //         (a) => a[fieldMappings.find((mapping) => mapping.property === 'email').column] === email
  //       )
  //     );

  //     await runCreateContacts(contactsData, fieldMappings, accessToken);
  //   } else {
  //     console.log('User is not authorized or has not installed an app');
  //     // Throw an error if the user is not authorized
  //     throw new Error('You are not authorized or have not installed an app');
  //   }
  // } catch (error) {
  //   console.error('Error uploading Spread sheet contacts:', error);
  // }
};

module.exports = { dataUploader };
