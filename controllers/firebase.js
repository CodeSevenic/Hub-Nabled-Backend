const {
  deleteUserAppAuth,
  updateSelectedCountry,
  getSelectedCountry,
} = require('../firebase/firebaseAdmin');

exports.deleteUserAccountAuth = async (req, res) => {
  const { userId, portalId } = req.params;

  try {
    await deleteUserAppAuth(userId, portalId);

    res.status(200).json({
      status: 'success',
      message: `App ${portalId} has been deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.selectCountryCode = async (req, res) => {
  const { hubspotId, countryCode } = req.body;
  if (!hubspotId || !countryCode || hubspotId === 'undefined' || hubspotId === undefined) {
    console.log('Missing hubspotId or countryCode');
    return res.status(400).send({ status: 'error', message: 'Missing hubspotId or countryCode' });
  }
  console.log('hubspotId: ', hubspotId, ' countryCode: ', countryCode);
  try {
    // Update or set a new entry in Firestore
    await updateSelectedCountry(hubspotId, countryCode);

    res.status(200).send({ status: 'success' });
  } catch (err) {
    res.status(500).send({ status: 'error', message: err.message });
  }
};

exports.getCountryCode = async (req, res) => {
  const { hubspotId } = req.params;
  if (!hubspotId || hubspotId === 'undefined' || hubspotId === undefined) {
    console.log('Missing hubspotId');
    return res.status(400).send({ status: 'error', message: 'Missing hubspotId' });
  }
  try {
    const selectedCountry = await getSelectedCountry(hubspotId);
    console.log('selectedCountry: ', selectedCountry);
    res.status(200).send({ selectedCountry });
  } catch (err) {
    res.status(500).send({ status: 'error', message: err.message });
  }
};
