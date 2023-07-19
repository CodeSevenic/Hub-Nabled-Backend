import React, { useEffect, useState } from 'react';
import { GoDotFill } from 'react-icons/go';
import { PiPlugBold, PiPlugsConnectedBold } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import FeatureToggle from '../components/FeatureToggle/FeatureToggle';
import Popup from '../components/Popup/Popup';
import { useAuthStateContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import DeletingAccountLoading from '../components/LoadingSpinner/deletingAccount';

const HubSpotPortal = () => {
  const { id } = useParams();
  const { deletingAccount } = useAuthStateContext();

  const [allFeatures, setAllFeatures] = useState([]);
  const [enabledFeatures, setEnabledFeatures] = useState([]);
  // State for the popup
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(null);

  // You might want to retrieve these values from somewhere else
  const userId = sessionStorage.getItem('userId');

  // Function to open the popup
  const openPopup = (feature) => {
    setCurrentFeature(feature);
    setPopupOpen(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setCurrentFeature(null);
    setPopupOpen(false);
  };

  const [loadingFeatures, setLoadingFeatures] = useState({});
  const [featureStatuses, setFeatureStatuses] = useState({});

  const handleToggle = async (featureName, isEnabled) => {
    console.log('handleToggle:', 'Name', featureName, 'IsEnabled:', isEnabled);
    // Set the feature as loading
    setLoadingFeatures((prevLoading) => ({ ...prevLoading, [featureName]: true }));

    // Update the status of the toggled feature
    setFeatureStatuses((prevStatuses) => ({ ...prevStatuses, [featureName]: isEnabled }));

    // Refetch the features
    await fetchAllFeatures();
    await fetchEnabledFeatures();

    // Set the feature as no longer loading
    setLoadingFeatures((prevLoading) => ({ ...prevLoading, [featureName]: false }));
  };

  const fetchAllFeatures = async () => {
    try {
      // Fetch all features
      const response = await fetch('http://localhost:4000/api/all-features');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAllFeatures(data);

      // Set the initial feature statuses
      const initialFeatureStatuses = data.reduce((statuses, feature) => {
        statuses[feature.name] = false;
        return statuses;
      }, {});

      setFeatureStatuses(initialFeatureStatuses);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEnabledFeatures = async () => {
    try {
      // Fetch enabled features
      const response = await fetch(`http://localhost:4000/api/enabled-features/${userId}/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setEnabledFeatures(data);

      // Update the feature statuses for enabled features
      data.forEach((feature) => {
        setFeatureStatuses((prevStatuses) => ({ ...prevStatuses, [feature.name]: true }));
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchAllFeatures();
    fetchEnabledFeatures();
  }, [userId, id]);

  return (
    <>
      <div className="pb-11 pt-5  shadow-lg bg-slate-100 dark:bg-[#42464D] m-10 rounded-lg relative overflow-hidden">
        {' '}
        {deletingAccount && <DeletingAccountLoading />}
        {/* Popup component */}
        {currentFeature && (
          <Popup
            isOpen={isPopupOpen}
            onRequestClose={closePopup}
            feature={currentFeature}
            portalId={id}
          />
        )}
        <section className="px-4 pt-10 md:pt-0 flex flex-wrap gap-5 justify-between">
          <h2 className="text-[12px] font-semibold text-gray-600 dark:text-gray-200">
            HS Portal: {id}
          </h2>
        </section>
        <h3 className="text-3xl flex items-center  font-semibold pl-4 mt-8 text-gray-500">
          Active Plugins
          <GoDotFill className="flex items-center mt-2 text-green-600" />
        </h3>
        {/* Active Plugins Grid */}
        <div className="m-4 grid gap-7 grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
          {enabledFeatures.length > 0 ? (
            enabledFeatures.map((feature, index) => {
              const isLoading = loadingFeatures[feature.name];
              // Check if the feature is enabled
              const isEnabled = featureStatuses[feature.name];
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-secondary-dark-bg flex flex-col justify-center p-5 shadow-lg  rounded-3xl relative overflow-hidden"
                >
                  {isLoading && <LoadingSpinner />}
                  <h4 className="dark:text-gray-200 font-semibold text-gray-500 flex items-center gap-4">
                    <span>
                      <PiPlugsConnectedBold className="text-btn2" />
                    </span>
                    {feature.name}
                  </h4>
                  {/* <p className="my-4 text-gray-500">{feature.description}</p> */}
                  <div className="flex gap-5">
                    <button
                      onClick={() => openPopup(feature)}
                      className="bg-btn2 text-sm text-white font-semibold mt-5 px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Config
                    </button>
                    <FeatureToggle
                      userId={userId}
                      featureName={feature.featureId}
                      portalId={id}
                      isEnabled={isEnabled}
                      onToggle={() => handleToggle(feature.name, !isEnabled)}
                      disabled={!isEnabled} // In the enabledFeatures list, the disable button should be active
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <h4 className="font-semibold  text-gray-500 flex items-center gap-4 ">
              No active plugins 😒
            </h4>
          )}
        </div>
        <h3 className="text-3xl flex items-center  font-semibold pl-4 mt-16 text-gray-500">
          All Plugins
          <GoDotFill className="flex items-center mt-2" />
        </h3>
        {/* All Plugins Grid */}
        <div className="m-4 grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-7">
          {allFeatures.map((feature, index) => {
            const isEnabled = featureStatuses[feature.name];
            const isLoading = loadingFeatures[feature.name];
            return (
              <div
                key={index}
                className="bg-white dark:bg-secondary-dark-bg  flex flex-col shadow-lg justify-center p-5  rounded-3xl relative overflow-hidden"
              >
                {isLoading && <LoadingSpinner />}
                <h4 className=" font-semibold dark:text-gray-200 text-gray-500 flex items-center gap-4">
                  <span>
                    <PiPlugBold className="text-btn1" />
                  </span>
                  {feature.name}
                </h4>
                <p className="my-4 flex-grow dark:text-gray-400 text-gray-500">
                  {feature.description}
                </p>
                <div className="flex gap-5">
                  {/* <button className="bg-btn2 text-sm text-white font-semibold mt-5 px-5 py-2 rounded-xl">
            View
          </button> */}
                  <FeatureToggle
                    userId={userId}
                    featureName={feature.featureId}
                    portalId={id}
                    isEnabled={isEnabled}
                    onToggle={() => handleToggle(feature.name, !isEnabled)}
                    disabled={isLoading || isEnabled}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HubSpotPortal;
