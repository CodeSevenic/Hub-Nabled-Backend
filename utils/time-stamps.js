const generateExpiryTimestamp = (expiresIn) => {
  const expiresInMilliseconds = expiresIn * 1000; // Convert seconds to milliseconds
  return Date.now() + expiresInMilliseconds;
};

const isTokenExpired = (expiryTimestamp) => {
  const now = Date.now();
  return now > expiryTimestamp;
};

module.exports = {
  generateExpiryTimestamp,
  isTokenExpired,
};
