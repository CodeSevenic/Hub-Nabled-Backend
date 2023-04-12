const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyC-PJULEiHyN_Yp5oDXDh7mZ_8jifkPUno',
  authDomain: 'hub-nabled.firebaseapp.com',
  projectId: 'hub-nabled',
  storageBucket: 'hub-nabled.appspot.com',
  messagingSenderId: '820374872726',
  appId: '1:820374872726:web:421dd64cf3c603323bd8b7',
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

module.exports = {
  firestore,
};
