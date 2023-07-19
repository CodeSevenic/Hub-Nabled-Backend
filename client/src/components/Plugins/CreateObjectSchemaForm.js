import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdOutlineClear } from 'react-icons/md';
import { IoIosSave } from 'react-icons/io';
import ExecuteFeatureButton from '../ExecuteFeatureButton/ExecuteFeatureButton';

function CreateObjectSchemaForm({ userId, hubspotId, featureId }) {
  const [singularLabel, setSingularLabel] = useState('');
  const [pluralLabel, setPluralLabel] = useState('');
  const [primaryDisplayProperty, setPrimaryDisplayProperty] = useState('');
  const [objectName, setObjectName] = useState('');
  const [properties, setProperties] = useState([{}]);

  const [privateAppToken, setPrivateAppToken] = useState(
    sessionStorage.getItem('privateAppToken') || ''
  );
  const [isTokenSaved, setIsTokenSaved] = useState(
    sessionStorage.getItem('privateAppToken') ? true : false
  );

  const handlePropertyFieldChange = (index, event) => {
    const values = [...properties];
    values[index][event.target.name] = event.target.value;
    setProperties(values);
  };

  const handleAddFields = (e) => {
    e.preventDefault();
    setProperties([...properties, {}]);
  };

  const handleRemoveFields = (index) => {
    const values = [...properties];
    values.splice(index, 1);
    setProperties(values);
  };

  const schema = {
    labels: {
      singular: singularLabel,
      plural: pluralLabel,
    },
    requiredProperties: properties.map((prop) => prop.name),
    searchableProperties: [],
    primaryDisplayProperty: primaryDisplayProperty,
    secondaryDisplayProperties: [],
    properties: properties.map((prop) => ({
      name: prop.name,
      label: prop.label,
      isPrimaryDisplayLabel: prop.name === primaryDisplayProperty,
    })),
    associatedObjects: ['CONTACT'],
    name: objectName,
  };
  useEffect(() => {
    if (sessionStorage.getItem('privateAppToken')) {
      setPrivateAppToken(sessionStorage.getItem('privateAppToken'));
    }
  }, []);

  const saveToken = (e) => {
    e.preventDefault();
    sessionStorage.setItem('privateAppToken', privateAppToken);
    setIsTokenSaved(true);
  };

  const clearToken = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('privateAppToken');
    setPrivateAppToken('');
    setIsTokenSaved(false);
  };

  const classInput =
    'p-2 border bg-slate-100 border-gray-300 rounded-xl text-[12px] w-full focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent';

  return (
    <form className="flex flex-col gap-5">
      <div className="flex gap-5 w-full">
        <input
          className={`${classInput} ${
            isTokenSaved ? 'blur-[2px] border-btn1 select-none pointer-events-none' : ''
          } `}
          type="text"
          value={privateAppToken}
          onChange={(e) => setPrivateAppToken(e.target.value)}
          placeholder="Private app token"
        />
        {!isTokenSaved ? (
          <button onClick={saveToken}>
            <IoIosSave className="text-btn2" />
          </button>
        ) : (
          <button onClick={clearToken}>
            <MdOutlineClear className="text-red-900" />
          </button>
        )}
      </div>
      <div className="flex gap-5 w-full">
        <input
          className={classInput}
          type="text"
          value={singularLabel}
          onChange={(e) => setSingularLabel(e.target.value)}
          placeholder="Singular label"
        />
        <input
          className={classInput}
          type="text"
          value={pluralLabel}
          onChange={(e) => setPluralLabel(e.target.value)}
          placeholder="Plural label"
        />
      </div>
      <div className="flex gap-5">
        <input
          className={classInput}
          type="text"
          value={primaryDisplayProperty}
          onChange={(e) => setPrimaryDisplayProperty(e.target.value)}
          placeholder="Primary display property"
        />
        <input
          className={classInput}
          type="text"
          value={objectName}
          onChange={(e) => setObjectName(e.target.value)}
          placeholder="Object name (lowercase)"
        />
      </div>
      <div className="my-4 flex flex-col gap-5">
        {properties.map((property, index) => (
          <div className="flex gap-5" key={`${property}-${index}`}>
            <input
              className={classInput}
              type="text"
              name="name"
              value={property.name || ''}
              onChange={(e) => handlePropertyFieldChange(index, e)}
              placeholder="Property name (lowercase)"
            />
            <input
              className={classInput}
              type="text"
              name="label"
              value={property.label || ''}
              onChange={(e) => handlePropertyFieldChange(index, e)}
              placeholder="Property label"
            />
            <button onClick={() => handleRemoveFields(index)} type="button">
              <RiDeleteBin6Line className="text-red-900" />
            </button>
          </div>
        ))}
      </div>

      <button
        className="bg-btn1 px-8 py-2 text-white rounded-xl max-w-fit mx-auto"
        onClick={handleAddFields}
      >
        Add property
      </button>

      <ExecuteFeatureButton
        userId={userId}
        hubspotId={hubspotId}
        featureId={featureId}
        postData={schema}
      />
    </form>
  );
}

export default CreateObjectSchemaForm;
