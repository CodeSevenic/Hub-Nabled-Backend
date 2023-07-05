const { deleteUserAppAuth } = require('../firebase/firebaseAdmin');

exports.deleteUserAccountAuth = async (req, res) => {
  const { userId } = req.params;
  const { portalId } = req.body;

  try {
    await deleteUserAppAuth(userId, portalId);

    res.status(200).json({
      status: 'success',
      message: `App ${appId} has been deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
