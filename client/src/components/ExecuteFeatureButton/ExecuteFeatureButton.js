import React from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';
import baseURL from '../../url';

const ExecuteFeatureButton = ({ userId, hubspotId, featureId, postData }) => {
  const [isExecuting, setIsExecuting] = React.useState(false);
  const executeFeature = async (e) => {
    e.preventDefault();
    console.log('Props', featureId, userId, hubspotId, postData);
    try {
      const response = await axios.post(
        `${baseURL}/api/execute-feature/${userId}/${hubspotId}/${featureId}`,
        postData // passed as the body of the POST request
      );

      console.log(response.data);
    } catch (error) {
      console.error('Error executing feature:', error);
    }
  };

  const executeFeatureWithWarning = async (e) => {
    e.preventDefault();
    executeFeature(e);
  };

  const warningPopup = () => {
    return (
      <>
        {/* overlays a warning popup */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-90 z-10"></div>
        <div
          className="absolute z-40 w-full max-w-[90%] bg-white rounded-md py-8 px-5 shadow-md"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <p className="font-semibold mb-3">
            <span className="text-red-400">Caution!</span> Initiating a Re-run will reformat all
            contacts within your HubSpot portal, including those previously processed.
          </p>
          <p className="font-semibold">
            Please note, the plugin integration is currently active and processing new or updated
            contacts in real-time. To ensure data integrity and efficiency, we recommend avoiding
            unnecessary re-runs. It is safer and more effective to rely on the plugin's real-time
            updates.
          </p>
          <div className="flex gap-5 justify-center mt-5">
            <button
              className="bg-red-500 rounded-xl max-w-fit flex gap-3 items-center py-2 px-8 text-white"
              onClick={executeFeatureWithWarning}
            >
              <FaPlay className="text-xl" />
              Re-run
            </button>
            <button
              className="bg-btn2 rounded-xl max-w-fit  flex gap-3 items-center py-2 px-8 text-white"
              onClick={() => setIsExecuting(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {isExecuting && warningPopup()}
      <button
        className="bg-btn2 rounded-xl max-w-fit mx-auto mt-5 mb-10 flex gap-3 items-center py-2 px-8 text-white"
        onClick={() => setIsExecuting(true)}
      >
        <FaPlay className="text-[12px]" /> Re-run Plugin
      </button>
    </>
  );
};

export default ExecuteFeatureButton;
