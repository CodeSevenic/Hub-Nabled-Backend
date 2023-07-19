import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import 'react-toastify/dist/ReactToastify.min.css';
import { Link } from 'react-router-dom';
import YuboBg from '../../assets/images/yubo_portal_login_page_L-min.jpg';
import Logo from '../../assets/images/Artboard.png';
import Y_axis_logo from '../../assets/images/YoboDataLogo.png';
import { useAuthStateContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Footer from '../../components/Footer';
import AddAccount from '../../components/AddAccount';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);

  const { register, setIsLoggedIn } = useAuthStateContext();

  const handleSubmit = async (e) => {
    setLoadingSpinner(true);
    e.preventDefault();
    if (!username || !email || !password || !phoneNumber || !confirmPassword) {
      console.log('All fields are required');
      toast.error('All fields are required');
      setLoadingSpinner(false);
      return;
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      toast.error('Passwords do not match');
      setLoadingSpinner(false);
      return;
    }
    try {
      const response = await register(username, email, password, phoneNumber);
      console.log('STATUS: ', response);
      if (response.isLoggedIn) {
        setLoadingSpinner(false);
        setRegisterSuccess(true);
        console.log('Register success: ', registerSuccess);
        return;
      } else {
        toast.error(response.error);
        setLoadingSpinner(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.error);
      setLoadingSpinner(false);
    }
  };

  const handleSkip = () => {
    // check sessionStorage for isLoggedIn value and convert to boolean
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      setIsLoggedIn(true);
    }
  };

  const classLabel = 'block font-medium text-gray-700 mb-2';
  const classInput =
    'p-2 border bg-slate-100 border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent';

  return (
    <>
      <div className="">
        <div className="overflow-x-hidden relative">
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />

          <div className="grid grid-cols-2 max-w-5xl mx-auto min-h-[85vh] ">
            <div className="my-auto flex items-center relative">
              <div
                className={`${
                  registerSuccess ? 'max-w-[0px] overflow-hidden ' : 'mr-32 max-w-[600px] flex-grow'
                } transition-all duration-200 relative`}
              >
                {loadingSpinner && <LoadingSpinner />}
                <img
                  className="mx-auto mb-8"
                  width={100}
                  height={100}
                  src={Logo}
                  alt="YuboData Logo"
                />
                <p className="text-gray-500 text-sm font-semibold mb-5 text-center">
                  Enter your email and password to log in
                </p>
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="flex flex-col mb-8">
                    <label className={`${classLabel} `} htmlFor="username">
                      Username:
                    </label>
                    <input
                      placeholder="Username"
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="off"
                      className={`${classInput}`}
                    />
                  </div>
                  <div className="flex flex-col mb-8">
                    <label className={`${classLabel} `} htmlFor="email">
                      Email:
                    </label>
                    <input
                      placeholder="Email"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="off"
                      className={`${classInput}`}
                    />
                  </div>
                  <div className="flex flex-col mb-8">
                    <label className={`${classLabel}`} htmlFor="phone">
                      Phone:
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="ZA"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      id="phone"
                      required
                      className={`${classInput}`}
                    />
                  </div>
                  <div className="flex flex-col mb-14">
                    <label className={`${classLabel} `} htmlFor="password">
                      Password:
                    </label>
                    <input
                      placeholder="Password"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={`${classInput}`}
                    />
                  </div>
                  <div className="flex flex-col mb-14">
                    <label className={`${classLabel} `} htmlFor="confirmPassword">
                      Confirm Password:
                    </label>
                    <input
                      placeholder="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={`${classInput}`}
                    />
                  </div>
                  <button
                    className="bg-btn1 px-5 block py-2 w-full rounded-xl mb-8 font-semibold text-white hover:shadow-lg transition-all duration-300"
                    type="submit"
                  >
                    Register
                  </button>
                </form>
                <div className="flex gap-5 justify-center">
                  <p className="font-semibold text-gray-500">Already have an account?</p>
                  <Link to={'/login'}>
                    <button className="text-btn2 font-medium">Log in</button>
                  </Link>
                </div>
              </div>
              <div
                className={`${
                  registerSuccess ? 'mr-32 max-w-[600px]' : 'max-w-0 overflow-hidden'
                } transition-all duration-200 w-full flex-grow`}
              >
                {/* <LoadingSpinner /> */}
                <img
                  className="mx-auto mb-8"
                  width={100}
                  height={100}
                  src={Logo}
                  alt="YuboData Logo"
                />
                <p className="text-gray-500 text-3xl font-semibold mb-5 text-center">
                  Great! you have successfully registered!
                </p>
                <div>
                  <p className="text-gray-500 font-semibold mt-8 text-center">
                    Connect a HubSpot account or skip to your user portal
                  </p>
                  <div className="flex flex-col items-center justify-center mb-10">
                    <AddAccount />

                    <div>
                      <button
                        onClick={handleSkip}
                        className="hover:shadow-lg font-semibold text-btn2"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>

                {/* <div className="flex gap-5 justify-center">
                  <p className="font-semibold text-gray-500">Already have an account?</p>
                  <Link to={'/login'}>
                    <button className="text-btn2 font-medium">Log in</button>
                  </Link>
                </div> */}
              </div>
            </div>

            <div className="relative overflow-hidden w-[100vw] rounded-bl-[30px]">
              <div
                style={{
                  backgroundImage: `url(${YuboBg})`,
                }}
                className="absolute h-full  w-full min-h-screen bg-cover bg-center bg-no-repeat"
              ></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-12 bg-white h-full px-2 py-8">
            <img src={Y_axis_logo} alt="Y axis YuboData Logo" />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Register;
