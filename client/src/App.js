import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import {
  Ecommerce,
  Orders,
  Calendar,
  Employees,
  Stacked,
  Pyramid,
  Customers,
  Kanban,
  Line,
  Area,
  Bar,
  Pie,
  Financial,
  ColorPicker,
  ColorMapping,
  Editor,
} from './pages';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';
import Login from './pages/Auth/Login.js';
import SettingsIcon from './components/SettingsIcon';
import Layout from './components/Layout/Layout';
import PrivateRoutes from './components/PrivateRoutes/PrivateRoutes';
import PublicRoutes from './components/PublicRoutes/PublicRoutes';
import HubSpotPortal from './pages/HubSpotPortal';
import Register from './pages/Auth/Register';
import OauthComplete from './components/OauthComplete';
import { useAuthStateContext } from './contexts/AuthContext';
import NoPortalsAdded from './components/NoPortalsAdded';
import PasswordReset from './pages/Auth/PasswordReset';
import ErrorExistingPortal from './components/ErrorExistingPortal';
import DataUploader from './components/Plugins/DataUploader';

const App = () => {
  const { setCurrentColor, setCurrentMode, currentMode, activeMenu, themeSettings } =
    useStateContext();
  const { authAccountDeleted, hubSpotIds, setIsLoggedIn, handleDeleteAccount } =
    useAuthStateContext();

  console.log('NAME: ', process.env.REACT_APP_NAME);

  // useEffect function to handle messages from the OAuth window
  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }
    const handleMessage = (event) => {
      const expectedOrigin = 'http://localhost:3000'; // Replace with your expected origin

      if (event.origin !== expectedOrigin) {
        console.warn('Received message from untrusted origin, ignoring.');
        return;
      }

      if (event.data.command === 'close') {
        window.close();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className={currentMode === 'Dark' ? 'dark h-full' : 'h-full'}>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/login" element={<PublicRoutes />}>
            <Route index element={<Login />} />
          </Route>
          <Route path="/register" element={<PublicRoutes />}>
            <Route index element={<Register />} />
          </Route>
          <Route path="/password-reset" element={<PublicRoutes />}>
            <Route index element={<PasswordReset />} />
          </Route>
          <Route path="/oauth-complete" element={<OauthComplete />} />
          <Route path="/excel" element={<DataUploader />} />
          <Route path="/error-existing-portal" element={<ErrorExistingPortal />} />
          <Route
            path="*"
            element={
              <PrivateRoutes activeMenu={activeMenu} themeSettings={themeSettings}>
                <Routes>
                  {/* HS Portal */}
                  {
                    <>
                      {hubSpotIds.length === 0 ? (
                        <Route path="/hs-account/no-account-portal" element={<NoPortalsAdded />} />
                      ) : (
                        <Route path="/hs-account/:id" element={<HubSpotPortal />} />
                      )}
                    </>
                  }
                  {/* dashboard  */}
                  <Route
                    path="/"
                    element={hubSpotIds.length === 0 ? <NoPortalsAdded /> : <HubSpotPortal />}
                  />
                  <Route path="/ecommerce" element={<Ecommerce />} />

                  {/* pages  */}
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/customers" element={<Customers />} />

                  {/* apps  */}
                  <Route path="/kanban" element={<Kanban />} />
                  <Route path="/editor" element={<Editor />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/color-picker" element={<ColorPicker />} />

                  {/* charts  */}
                  <Route path="/line" element={<Line />} />
                  <Route path="/area" element={<Area />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/color-mapping" element={<ColorMapping />} />
                  <Route path="/pyramid" element={<Pyramid />} />
                  <Route path="/stacked" element={<Stacked />} />
                </Routes>
              </PrivateRoutes>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
