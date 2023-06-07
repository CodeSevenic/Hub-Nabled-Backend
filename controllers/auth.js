const { generateUniqueID } = require('../../hb-frontend/src/utils/idGenerator');
const { comparePassword, hashPassword } = require('../utils/password-util');
const { db, getUserByEmail, getUserById, getAppTokens } = require('../firebase/firebaseAdmin');
const { getAccessToken, getContact } = require('../services/hubspot');

// function for user registration API

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email already exists in the database
    const userDocRef = db.doc(`users/${email}`);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      console.log('Email already in use');
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Implement user registration logic here
    const userId = generateUniqueID(); // Generate a unique user ID
    console.log('UserID: ', userId);

    console.log(email, password, userId);
    // Hash the password before storing it (bcrypt, for example)
    const hashedPassword = await hashPassword(password);

    // Save user info
    await db.collection('users').doc(userId).set({
      userId: userId,
      email: email,
      password: hashedPassword,
    });

    res.status(200).json({ status: true, message: 'User registered successfully', userId, email });
  } catch (error) {
    res
      .status(400)
      .json({ status: false, message: 'User registration failed', error: error.message });
  }
};

// function for user login API
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Save user email to the session
    req.session.userEmail = email;

    // Retrieve the user document from Firestore based on the provided email
    const userData = await getUserByEmail(email);

    // Verify the password
    const isValidPassword = await comparePassword(password, userData.password);

    // Check if the user document exists and the password is correct
    if (isValidPassword) {
      // If both conditions are met, the user is considered logged in
      console.log('Login successfully');

      // save userId to the session
      req.session.userId = userData.userId;

      const user = await getUserById(userData.userId);

      // check if user and user.appAuths are both defined
      if (!user || !user.appAuths || Object.keys(user.appAuths).length === 0) {
        req.session.hasApp = false;
        console.log('No app found');
      } else {
        req.session.hasApp = true;
        console.log('App found');
      }

      console.log('SessionID: ', req.sessionID);

      res.status(200).json({
        message: 'User logged in successfully',
        userId: userData.userId,
        email,
        isAdmin: userData.isAdmin,
      });
    } else {
      console.log('Login Failed');
      // If either condition is not met, return an error message
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'User login failed', error: error.message });
  }
};
