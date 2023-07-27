import React from 'react';
import axios from 'axios'; // HTTP client for the browser and Node.js
import baseURL from '../../url';

const FeatureToggle = ({ userId, featureName, portalId, isEnabled, disabled, onToggle }) => {
  const toggleFeature = async () => {
    try {
      // Send a request to the server to toggle the feature
      const response = await axios.post(`${baseURL}/api/toggle-feature`, {
        userId: userId,
        featureName: featureName,
        isEnabled: !isEnabled,
        portalId: portalId,
      });

      console.log(response.data.message);

      // Update the state in the parent component
      onToggle(!isEnabled);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <button
      onClick={disabled ? null : toggleFeature}
      className={`text-sm text-white font-semibold mt-5 px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
      } ${!isEnabled ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {isEnabled ? 'Disable' : 'Enable'}
    </button>
  );
};

export default FeatureToggle;
