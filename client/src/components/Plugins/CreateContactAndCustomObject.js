import React, { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import ExecuteFeatureButton from '../ExecuteFeatureButton/ExecuteFeatureButton';

const CreateContactAndCustomObject = ({ userId, hubspotId, featureId }) => {
  const [contactInfo, setContactInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });
  const [customObjectInfo, setCustomObjectInfo] = useState({
    customObjectName: '',
    properties: [],
  });

  const handleChange = (e, setter) => {
    setter((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePropertyFieldChange = (index, e) => {
    const values = [...customObjectInfo.properties];
    values[index][e.target.name] = e.target.value;
    setCustomObjectInfo((prev) => ({
      ...prev,
      properties: values,
    }));
  };

  const handleAddFields = (e) => {
    e.preventDefault();
    setCustomObjectInfo((prev) => ({
      ...prev,
      properties: [...prev.properties, { name: '', label: '' }],
    }));
  };

  const handleRemoveFields = (index) => {
    const values = [...customObjectInfo.properties];
    values.splice(index, 1);
    setCustomObjectInfo((prev) => ({
      ...prev,
      properties: values,
    }));
  };

  const postData = {
    contactInfo,
    customObjectInfo,
  };

  const classInput =
    'p-2 border bg-slate-100 border-gray-300 rounded-xl text-[12px] w-full focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent';
  return (
    <form>
      <div className="flex flex-col gap-5">
        <h4 className="m-0 font-semibold text-gray-600">Create Contact</h4>
        <input
          className={classInput}
          type="text"
          name="firstname"
          value={contactInfo.firstname}
          onChange={(e) => handleChange(e, setContactInfo)}
          placeholder="First Name"
        />
        <input
          className={classInput}
          type="text"
          name="lastname"
          value={contactInfo.lastname}
          onChange={(e) => handleChange(e, setContactInfo)}
          placeholder="Last Name"
        />
        <input
          className={classInput}
          type="text"
          name="email"
          value={contactInfo.email}
          onChange={(e) => handleChange(e, setContactInfo)}
          placeholder="Email"
        />
      </div>
      <div className="flex flex-col gap-5">
        <h4 className="m-0 p-4 font-semibold text-gray-600">Create Custom Object</h4>
        <input
          className={classInput}
          type="text"
          name="customObjectName"
          value={customObjectInfo.customObjectName}
          onChange={(e) => handleChange(e, setCustomObjectInfo)}
          placeholder="ObjectId (e.g. 2-11000871)"
        />
        {customObjectInfo.properties.map((property, index) => (
          <div className="flex gap-5" key={index}>
            <input
              className={classInput}
              type="text"
              name="name"
              value={property.name}
              onChange={(e) => handlePropertyFieldChange(index, e)}
              placeholder="Property name (lowercase)"
            />
            <input
              className={classInput}
              type="text"
              name="label"
              value={property.label}
              onChange={(e) => handlePropertyFieldChange(index, e)}
              placeholder="Property label"
            />
            <button type="button" onClick={() => handleRemoveFields(index)}>
              <RiDeleteBin6Line className="text-red-900" />
            </button>
          </div>
        ))}
        <button
          className="bg-btn1 px-8 py-2 text-white rounded-xl max-w-fit mx-auto"
          type="button"
          onClick={handleAddFields}
        >
          Add Property
        </button>
      </div>
      <ExecuteFeatureButton
        userId={userId}
        hubspotId={hubspotId}
        featureId={featureId}
        postData={postData}
      />
    </form>
  );
};

export default CreateContactAndCustomObject;
