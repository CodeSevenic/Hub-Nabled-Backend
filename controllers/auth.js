const { setDoc, doc, getDoc } = require('firebase/firestore');
const { db } = require('../firebase/index');
const { generateUniqueID } = require('../../hb-frontend/src/utils/idGenerator');
const { comparePassword, hashPassword } = require('../utils/password-util');

// function for user registration API
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email already exists in the database
    const userDocRef = doc(db, 'users', email);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
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
    await setDoc(doc(db, 'users', email), {
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

    //
    console.log('Email: ', email, 'Password: ', password);

    // Retrieve the user document from Firestore based on the provided email
    const userDoc = await getDoc(doc(db, 'users', email));

    const isValidPassword = await comparePassword(password, userDoc.data().password);

    console.log('User Info: ', userDoc.data());

    console.log('isValidPassword: ', isValidPassword);

    // Check if the user document exists and the password is correct
    if (userDoc.exists() && isValidPassword) {
      // If both conditions are met, the user is considered logged in
      console.log('Login successfully');
      res.status(200).json({
        message: 'User logged in successfully',
        userId: userDoc.data().userId,
        email,
        isAdmin: userDoc.data().isAdmin,
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
