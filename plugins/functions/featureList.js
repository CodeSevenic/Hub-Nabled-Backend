const contactNameFormatterLimiterToList = require('../contactNameFormatterLimitToList');
const { createContactAndCustomObject } = require('../createContactAndCustomObject');
const { createObjectSchema } = require('../createObjectSchema');
const { dataUploader } = require('../dataUploader');
const { fetchHubSpotContacts } = require('../fetchContacts');
const nameFormatter = require('../nameFormatter');
const phoneNumberFormatter = require('../phoneNumberFormatter');
const unknownContactNameCreator = require('../unknownContactNameCreator');

exports.featuresList = {
  nameFormatter: {
    name: 'Hubspot Contact Name Formatter',
    function: nameFormatter,
    description:
      "Like the HubSpot Contact Number Formatter, this specialized solution is tailored to optimize your contact management within a specific list in HubSpot. Effortlessly format phone numbers based on the contact's IP country code or a selected default country.",
    featureId: 'nameFormatter',
  },
  phoneNumberFormatter: {
    name: 'Phone Number Formatter',
    function: phoneNumberFormatter,
    description:
      "A powerful solution designed to streamline your contact management process. With this innovative tool, you can effortlessly format phone numbers in HubSpot using either the contact's own IP country code or a selected default country for all your contacts.",
    featureId: 'phoneNumberFormatter',
  },
  unknownContactNameCreator: {
    name: 'Unknown Contact Name Creator',
    function: unknownContactNameCreator,
    description:
      'A cutting-edge solution designed to extract and format first and last names from contact emails. With this innovative tool, you can automatically generate accurate contact names by analyzing email addresses.',
    featureId: 'unknownContactNameCreator',
  },
  // createObjectSchema: {
  //   name: 'Object Schema Creator',
  //   function: createObjectSchema,
  //   description: 'Create Object Schema in your connected HubSpot portal',
  //   featureId: 'createObjectSchema',
  // },
  // createContactAndCustomObject: {
  //   name: 'Create Contact and Custom Object',
  //   function: createContactAndCustomObject,
  //   description:
  //     'Create a contact and associate it with a custom object in your connected HubSpot portal',
  //   featureId: 'createContactAndCustomObject',
  // },
  // contactNameFormatterLimiterToList: {
  //   name: 'HubSpot Contact Number Formatter (Limit to List)',
  //   function: contactNameFormatterLimiterToList,
  //   description:
  //     'Effortlessly update and standardize contact names by removing special characters, consolidating multiple first names, adding missing surnames where possible, and proper capitalization. Perfect for maintaining consistent and professional contact data.',
  //   featureId: 'contactNameFormatterLimiterToList',
  // },
  // dataUploader: {
  //   name: 'Data Uploader',
  //   function: dataUploader,
  //   description:
  //     'Effortlessly upload data to your connected HubSpot portal. Perfect for bulk uploading contacts, companies, deals, tickets, and more. Supports mapping custom fields and handling duplicate records.',
  //   featureId: 'dataUploader',
  // },
  // Add other feature-function mappings here...
};
