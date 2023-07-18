// Import the 'uuid' package
const { v4: uuidv4 } = require('uuid');

exports.generateUniqueID = () => {
  // Get the current timestamp as a string
  const timestamp = new Date().getTime().toString();

  // Generate a random UUID
  const randomUuid = uuidv4();

  // Combine the timestamp and random UUID
  const uniqueID = `${timestamp}-${randomUuid}`;

  return uniqueID;
};
