// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  getIdToken,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

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
