import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

import { Button } from '.';
import { userProfileData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import avatar from '../data/avatar.jpg';
import { useAuthStateContext } from '../contexts/AuthContext';
import baseURL from '../url';

const UserProfile = () => {
  const { currentColor, isClicked, setIsClicked, initialState } = useStateContext();
  const { setIsLoggedIn } = useAuthStateContext();

  const handleLogout = async (e) => {
    setIsClicked(initialState);
    e.preventDefault();
    console.log('isClicked:', isClicked);
    try {
      const response = await fetch(`${baseURL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Logout successful');
        // clear prevUrl from localStorage

        sessionStorage.clear();
        setIsLoggedIn(false);
      } else {
        console.log('Logout failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="nav-item absolute right-1 shadow-xl top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-end items-center">
        {/* <p className="font-semibold text-lg dark:text-gray-200">User Profile</p> */}
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      {/* <div className="flex gap-5 items-center mt-6 border-color border-b-1 pb-6">
        <img
          className="rounded-full h-24 w-24"
          src={avatar}
          alt="user-profile"
        />
        <div>
          <p className="font-semibold text-xl dark:text-gray-200"> Michael Roberts </p>
          <p className="text-gray-500 text-sm dark:text-gray-400">  Administrator   </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400"> info@shop.com </p>
        </div>
      </div>
      <div>
        {userProfileData.map((item, index) => (
          <div key={index} className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer  dark:hover:bg-[#42464D]">
            <button
              type="button"
              style={{ color: item.iconColor, backgroundColor: item.iconBg }}
              className=" text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              {item.icon}
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200 ">{item.title}</p>
              <p className="text-gray-500 text-sm dark:text-gray-400"> {item.desc} </p>
            </div>
          </div>
        ))}
      </div> */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleLogout}
          style={{ backgroundColor: currentColor, color: 'white', borderRadius: '10px' }}
          className={`w-full text-[16px]  p-3  hover:drop-shadow-xl`}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
