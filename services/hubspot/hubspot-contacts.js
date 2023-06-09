const getContacts = async (accessToken) => {
  console.log('=== Retrieving all contacts from HubSpot using the access token ===');

  let after = '';
  let allContacts = [];
  let keepGoing = true;

  while (keepGoing) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      let url = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=100';
      if (after) {
        url += `&after=${after}`;
      }

      const { data } = await axios.get(url, { headers });
      allContacts = [...allContacts, ...data.results];

      if (data.paging) {
        after = data.paging.next.after;
      } else {
        keepGoing = false;
      }
    } catch (e) {
      console.error('Unable to retrieve contacts', e);
      throw e;
    }
  }
  return allContacts;
};

module.exports = {
  getContacts,
};
