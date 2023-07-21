// Popup.js
import React from 'react';
import Modal from 'react-modal';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import ExecuteFeatureButton from '../ExecuteFeatureButton/ExecuteFeatureButton';
import CreateObjectSchemaForm from '../Plugins/CreateObjectSchemaForm';
import CreateContactAndCustomObject from '../Plugins/CreateContactAndCustomObject';
import DataUploader from '../Plugins/DataUploader';

Modal.setAppElement('#root'); // Replace '#root' with the id of your root element if it's different

const Popup = ({ isOpen, onRequestClose, feature, portalId }) => {
  const userId = sessionStorage.getItem('userId');
  console.log('feature', feature, portalId);
  return (
    <Modal
      className="max-w-xl min-h-590 dark:bg-secondary-dark-bg  bg-gray-100 rounded-lg overflow-hidden  mx-auto my-32 text-center relative"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Feature Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0 0 0 / 50%)',
        },
      }}
    >
      <div className="bg-btn1 py-[10px] flex justify-center items-center relative">
        <h2 className="text-1xl mb-0 text-white font-semibold">{feature.name}</h2>
        <AiOutlineCloseCircle
          onClick={onRequestClose}
          className="absolute text-2xl translate-y-[-50%] top-[50%] right-6 text-white cursor-pointer"
        />
      </div>
      <div className="flex flex-col h-full px-4 overflow-y-auto">
        <div className="grow mb-8">
          <p className="mt-4">{feature.description}</p>
        </div>
        {
          // Switch statement to render the correct form for each feature
          feature.featureId === 'createObjectSchema' ? (
            <CreateObjectSchemaForm
              userId={userId}
              hubspotId={portalId}
              featureId={feature.featureId}
            />
          ) : feature.featureId === 'nameFormatter' ? (
            <ExecuteFeatureButton
              userId={userId}
              hubspotId={portalId}
              featureId={feature.featureId}
            />
          ) : feature.featureId === 'createContactAndCustomObject' ? (
            <CreateContactAndCustomObject
              userId={userId}
              hubspotId={portalId}
              featureId={feature.featureId}
            />
          ) : feature.featureId === 'phoneNumberFormatter' ? (
            <ExecuteFeatureButton
              userId={userId}
              hubspotId={portalId}
              featureId={feature.featureId}
            />
          ) : feature.featureId === 'unknownContactNameCreator' ? (
            <ExecuteFeatureButton
              userId={userId}
              hubspotId={portalId}
              featureId={feature.featureId}
            />
          ) : feature.featureId === 'dataUploader' ? (
            <DataUploader userId={userId} hubspotId={portalId} featureId={feature.featureId} />
          ) : (
            'No Plugin Component'
          )
        }
      </div>
    </Modal>
  );
};

export default Popup;
