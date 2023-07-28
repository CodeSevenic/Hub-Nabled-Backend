// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Your web app's Firebase configuration
//
const firebaseConfig = {
  apiKey: 'AIzaSyCsPFUPevaJJxNR_PHsBoTaeK1BQddgVoU',
  authDomain: 'yubodata-9137d.firebaseapp.com',
  projectId: 'yubodata-9137d',
  storageBucket: 'yubodata-9137d.appspot.com',
  messagingSenderId: '89046230269',
  appId: '1:89046230269:web:596a3347e7f368620cca94',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// Handle login with email and password
const loginWithEmailAndPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await getIdToken(userCredential.user);
  return idToken;
};

// Handle password reset
const handlePasswordResetEmail = async (email) => {
  let success = false;
  try {
    await sendPasswordResetEmail(auth, email);
    success = true;
    return success;
  } catch (error) {
    console.error(error);
    throw new Error('Error sending email, make sure email is correct');
  }
};

export { loginWithEmailAndPassword, handlePasswordResetEmail };

export default app;
