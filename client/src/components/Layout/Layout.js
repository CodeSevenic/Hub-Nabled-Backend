import React from 'react';

import SettingsIcon from '../SettingsIcon';
import ThemeSettings from '../ThemeSettings';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

function Layout({ children, activeMenu, themeSettings }) {
  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <SettingsIcon />

      {activeMenu ? (
        <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
          <Sidebar />
        </div>
      ) : (
        <div className="w-0 dark:bg-secondary-dark-bg">
          <Sidebar />
        </div>
      )}
      <div
        className={
          activeMenu
            ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  '
            : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
        }
      >
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
          <Navbar />
        </div>
        <div>
          {themeSettings && <ThemeSettings />}
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
