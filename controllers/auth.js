const { generateUniqueID } = require('../utils/idGenerator');
const { comparePassword, hashPassword } = require('../utils/password-util');
const {
  db,
  getUserByEmail,
  getUserById,
  getAppTokens,
  createUserInFirebase,
  createCustomTokenInFirebase,
  verifyUserInFirebase,
  verifyIdTokenInFirebase,
} = require('../firebase/firebaseAdmin');

// function for user registration API
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if the email already exists in the database
//     const userDocRef = db.doc(`users/${email}`);
//     const userDoc = await userDocRef.get();

//     if (userDoc.exists) {
//       console.log('Email already in use');
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     // Implement user registration logic here
//     const userId = generateUniqueID(); // Generate a unique user ID
//     console.log('UserID: ', userId);

//     console.log(email, password, userId);
//     // Hash the password before storing it (bcrypt, for example)
//     const hashedPassword = await hashPassword(password);

//     // Save user info
//     await db.collection('users').doc(userId).set({
//       username: username,
//       userId: userId,
//       email: email,
//       password: hashedPassword,
//     });

//     res.status(200).json({ status: true, message: 'User registered successfully', userId, email });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ status: false, message: 'User registration failed', error: error.message });
//   }
// };

// // function for user login API
// exports.login = async (req, res) => {
//   console.log('Login request received');
//   try {
//     const { email, password } = req.body;

//     // Save user email to the session
//     req.session.userEmail = email;

//     // Retrieve the user document from Firestore based on the provided email
//     const userData = await getUserByEmail(email);

//     // Verify the password
//     const isValidPassword = await comparePassword(password, userData.password);

//     // Check if the user document exists and the password is correct
//     if (isValidPassword) {
//       // If both conditions are met, the user is considered logged in
//       console.log('Login successfully');

//       // save userId to the session
//       req.session.userId = userData.userId;

//       const user = await getUserById(userData.userId);

//       // check if user and user.appAuths are both defined
//       if (!user || !user.appAuths || Object.keys(user.appAuths).length === 0) {
//         req.session.hasApp = false;
//         console.log('No app found');
//       } else {
//         req.session.hasApp = true;
//         console.log('App found');
//       }

//       res.status(200).json({
//         message: 'User logged in successfully',
//         userId: userData.userId,
//         isAdmin: userData.isAdmin ? userData.isAdmin : false,
//         isLoggedIn: true,
//         username: userData.username,
//         appAuths: user.appAuths ? user.appAuths : {},
//         features: user.features ? user.features : {},
//       });
//     } else {
//       console.log('Login Failed');
//       // If either condition is not met, return an error message
//       res.status(401).json({ message: 'Invalid email or password', isLoggedIn: false });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'User login failed', error: error.message });
//   }
// };

exports.getUserAuths = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);

    res.status(200).json({
      message: 'Successfully retrieved user auths',
      appAuths: user.appAuths ? user.appAuths : {},
    });
  } catch (error) {
    res.status(500).json({ message: "Couldn't  get user auths", error: error.message });
  }
};

exports.logout = async (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Logout successfully');
      req.session = null;
      res.status(200).json({ message: 'User logged out successfully' });
    }
  });
};

// Function for user registration API
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Create user in Firebase Auth
    const userRecord = await createUserInFirebase(email, password);

    console.log('Firebase User ID: ', userRecord.uid);

    // Save user info to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username: username,
      email: email,
      phone: phone,
    });

    // Get user data
    const userData = await db.collection('users').doc(userRecord.uid).get();

    res.status(200).json({
      message: 'User registered successfully',
      userId: userData.id,
      isAdmin: userData.data().isAdmin ? userData.data().isAdmin : false,
      isLoggedIn: true,
      username: userData.data().username,
      appAuths: userData.data().appAuths ? userData.data().appAuths : {},
      features: userData.data().features ? userData.data().features : {},
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: false, message: 'User registration failed', error: error.message });
  }
};

// Function for user login API
exports.login = async (req, res) => {
  try {
    const idToken = req.body.idToken;

    // Verify the Firebase ID token in the request
    const verifiedToken = await verifyIdTokenInFirebase(idToken);
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const uid = decodedToken.uid; // The Firebase user ID

    // Get user data from Firestore
    const userData = await db.collection('users').doc(verifiedToken).get();

    if (!userData.exists) {
      throw new Error('No user data found in Firestore');
    }
    console.log('Login successfully');
    res.status(200).json({
      message: 'User logged in successfully',
      userId: userData.id,
      isAdmin: userData.data().isAdmin ? userData.data().isAdmin : false,
      isLoggedIn: true,
      username: userData.data().username,
      appAuths: userData.data().appAuths ? userData.data().appAuths : {},
      features: userData.data().features ? userData.data().features : {},
    });
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
    } else if (error.code === 'auth/argument-error') {
      res.status(400).json({ message: 'Invalid ID token.' });
    } else {
      res.status(500).json({ message: 'User login failed', error: error.message });
    }
  }
};
