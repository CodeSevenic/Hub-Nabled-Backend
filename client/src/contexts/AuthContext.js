import React, { useState, createContext, useContext } from 'react';
import { loginWithEmailAndPassword } from '../firebase/firebase';
import baseURL from '../url';
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hubSpotIds, setHubSpotIds] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState({});
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [authAccountDeleted, setAuthAccountDeleted] = useState(false);

  function getHubSpotIds(data) {
    let names = [];
    for (let name in data.appAuths) {
      names.push(name);
    }
    sessionStorage.setItem('hubSpotIds', JSON.stringify(names));

    setHubSpotIds(names);

    return names;
  }

  const login = async (email, password) => {
    console.log('Login: email: ', email);

    const idToken = await loginWithEmailAndPassword(email, password);

    console.log('AuthContext: ', process.env.REACT_APP_FIREBASE_API_KEY);
    try {
      localStorage.removeItem('prevUrl');
      console.log('Login: email: ', email);
      const response = await fetch(`${baseURL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Perform other actions, like updating the state, redirecting to another page, etc.
        console.log('Login: Successfully went through!!!');
        console.log('Login: ', data);

        setUserData(data);
        // start by clearing sessionStorage
        sessionStorage.clear();
        // then set sessionStorage
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('isAdmin', data.isAdmin);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('isLoggedIn', data.isLoggedIn);

        getHubSpotIds(data);

        setIsLoggedIn(true);

        // Check if user is admin
        if (data.isAdmin === 'true') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        return data.userId;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      // Handle Firebase or server errors
      console.error(error);
    }
  };

  const register = async (username, email, password, phone) => {
    localStorage.removeItem('prevUrl');
    console.log('Register: email: ', email);
    const response = await fetch(`${baseURL}/api/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, phone }),
    });

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      // Perform other actions, like updating the state, redirecting to another page, etc.
      setUserData(data);
      // start by clearing sessionStorage
      sessionStorage.clear();
      // then set sessionStorage
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('isAdmin', data.isAdmin);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('isLoggedIn', data.isLoggedIn);

      getHubSpotIds(data);

      console.log('Register: Successfully went through!!!');
      return data;
    } else {
      const data = await response.json();
      return data;
    }
  };

  const installApp = async (appId) => {
    const response = await fetch('http://localhost:8000/api/install', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId }),
    });

    if (!response.ok) {
      throw new Error('App installation failed');
    }
  };

  const handleDeleteAccount = async (userId, portalId) => {
    setDeletingAccount(true);
    try {
      const res = await fetch(`${baseURL}/api/delete-account-auth/${userId}/${portalId}`, {
        method: 'POST', // Specify the method
        headers: {
          'Content-Type': 'application/json', // Set the content type to be JSON
        },
        credentials: 'include', // Include credentials for sessions
      });

      if (!res.ok) {
        setDeletingAccount(false);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      if (res.ok) {
        setDeletingAccount(false);
        setAuthAccountDeleted(true);

        setAuthAccountDeleted(true);

        // after 5 seconds, set authAccountDeleted back to false
        setTimeout(() => {
          setAuthAccountDeleted(false);
        }, 5000);

        return res.json(); // Parse the JSON response
      }
    } catch (error) {
      console.log(error); // Catch and log any errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        installApp,
        isAdmin,
        isLoggedIn,
        setIsAdmin,
        hubSpotIds,
        setHubSpotIds,
        setIsLoggedIn,
        userData,
        setUserData,
        authAccountDeleted,
        setAuthAccountDeleted,
        handleDeleteAccount,
        deletingAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStateContext = () => useContext(AuthContext);
