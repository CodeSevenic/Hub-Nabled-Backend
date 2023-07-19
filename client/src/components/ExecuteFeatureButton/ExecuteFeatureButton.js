import React from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';

const ExecuteFeatureButton = ({ userId, hubspotId, featureId, postData }) => {
  const executeFeature = async (e) => {
    e.preventDefault();
    console.log('Props', featureId, userId, hubspotId, postData);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/execute-feature/${userId}/${hubspotId}/${featureId}`,
        postData // passed as the body of the POST request
      );

      console.log(response.data);
    } catch (error) {
      console.error('Error executing feature:', error);
    }
  };

  return (
    <button
      className="bg-btn2 rounded-xl max-w-fit mx-auto mt-5 mb-10 flex gap-3 items-center py-2 px-8 text-white"
      onClick={executeFeature}
    >
      <FaPlay className="text-[12px]" /> Run Plugin
    </button>
  );
};

export default ExecuteFeatureButton;
