import React from 'react';
import AddAccount from './AddAccount';
// import './NoPortalsAdded.css';
const NoPortalsAdded = () => {
  return (
    <div className="no-portals h-screen shadow-lg dark:bg-[#42464D] bg-slate-100 m-10 rounded-lg">
      {/* Active Plugins Grid */}
      <div className="m-4 pt-20">
        <h2 className="font-semibold mx-auto max-w-lg text-2xl text-center text-gray-500 dark:text-gray-300">
          No Portals added yet, Please connect a HubSpot portal. 🙂
        </h2>
        <span className="block max-w-fit mx-auto">
          <AddAccount />
        </span>{' '}
      </div>
    </div>
  );
};

export default NoPortalsAdded;
