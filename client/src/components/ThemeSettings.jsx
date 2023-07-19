import React, { useState } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useNavigate, useParams } from 'react-router-dom';

import { themeColors } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuthStateContext } from '../contexts/AuthContext';

const ThemeSettings = () => {
  const { id } = useParams();

  const { setColor, setMode, currentMode, currentColor, setThemeSettings } = useStateContext();
  const { authAccountDeleted, hubSpotIds, handleDeleteAccount, deletingAccount } =
    useAuthStateContext();

  const [selectedAccountID, setSelectedAccountID] = useState(null);

  console.log('HubSpot Ids: ', hubSpotIds);

  const navigate = useNavigate();

  // You might want to retrieve these values from somewhere else
  const userId = sessionStorage.getItem('userId');

  const handleAccountSelection = async (hubSpotId) => {
    console.log('selectedAccountID:', hubSpotId);
    setSelectedAccountID(hubSpotId);
  };

  console.log('Selected Account ID:', selectedAccountID);

  const deleteAccount = async () => {
    console.log('deleteAccount:', selectedAccountID);
    await handleDeleteAccount(userId, selectedAccountID);

    // After deletion, find the next available id
    const nextIdIndex = hubSpotIds.indexOf(selectedAccountID) + 1;

    if (hubSpotIds[nextIdIndex]) {
      // If there is a next id, navigate to it
      navigate(`/hs-account/${hubSpotIds[nextIdIndex]}`);
    } else if (hubSpotIds.length > 1) {
      // If there's no next id, but there are other ids, navigate to the first one
      navigate(`/hs-account/${hubSpotIds[0]}`);
    } else {
      // If there are no more ids, navigate to the 'No Portal Added' page
      navigate(`/hs-account/no-account-portal`);
    }
  };

  return (
    <div className="bg-half-transparent w-screen fixed nav-item top-0 right-0">
      <div className="float-right h-screen dark:text-gray-200  bg-white dark:bg-[#484B52] w-400">
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-lg">Settings</p>
          <button
            type="button"
            onClick={() => setThemeSettings(false)}
            style={{ color: 'rgb(153, 171, 180)', borderRadius: '50%' }}
            className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <MdOutlineCancel />
          </button>
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-xl ">Theme Option</p>

          <div className="mt-4">
            <input
              type="radio"
              id="light"
              name="theme"
              value="Light"
              className="cursor-pointer"
              onChange={setMode}
              checked={currentMode === 'Light'}
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="light" className="ml-2 text-md cursor-pointer">
              Light
            </label>
          </div>
          <div className="mt-2">
            <input
              type="radio"
              id="dark"
              name="theme"
              value="Dark"
              onChange={setMode}
              className="cursor-pointer"
              checked={currentMode === 'Dark'}
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="dark" className="ml-2 text-md cursor-pointer">
              Dark
            </label>
          </div>
        </div>
        <div className="p-4 border-t-1 border-color ml-4">
          <p className="font-semibold text-xl ">Theme Colors</p>
          <div className="flex gap-3">
            {themeColors.map((item, index) => (
              <TooltipComponent key={index} content={item.name} position="TopCenter">
                <div
                  className="relative mt-2 cursor-pointer flex gap-5 items-center"
                  key={item.name}
                >
                  <button
                    type="button"
                    className="h-10 w-10 rounded-full cursor-pointer"
                    style={{ backgroundColor: item.color }}
                    onClick={() => setColor(item.color)}
                  >
                    <BsCheck
                      className={`ml-2 text-2xl text-white ${
                        item.color === currentColor ? 'block' : 'hidden'
                      }`}
                    />
                  </button>
                </div>
              </TooltipComponent>
            ))}
          </div>
        </div>
        <div className="ml-4 p-4">
          <p className="font-semibold text-sm text-red-500 mb-5">
            <span className="text-black dark:text-gray-200">Warning:</span> Clicking the button
            below will permanently delete the currently selected HubSpot account. Please ensure that
            this is your intended action, as this cannot be undone. you will need to re-connect your
            HubSpot account to continue using this app.
          </p>
          {/* Use these ['27001233', '139714747'] to create a dropdown for account selection */}

          <p className="text-[11px] font-semibold text-btn1 uppercase mb-5">
            Select HubSpot Account to delete
          </p>

          <select
            className="block w-full max-w-[209.53px] border-gray-400 border-solid border-1 bg-transparent mt-2 rounded-xl shadow-sm outline-none mb-5"
            onChange={(e) => handleAccountSelection(e.target.value)}
          >
            <option className="text-center" value="">
              Select HubSpot ID
            </option>
            {hubSpotIds.map((hubSpotId) => (
              <option
                className="text-center dark:text-gray-600"
                key={hubSpotId}
                onChange={(e) => handleAccountSelection(e.target.value)}
                value={hubSpotId}
              >
                {hubSpotId}
              </option>
            ))}
          </select>

          <button
            onClick={deleteAccount}
            className="block px-6 text-sm py-1 text-red-400 border-solid border-red-500 border-1 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Delete HubSpot Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
