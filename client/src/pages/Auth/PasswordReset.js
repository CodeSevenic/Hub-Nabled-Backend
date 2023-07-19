import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { Link } from 'react-router-dom';
import YuboBg from '../../assets/images/yubo_portal_login_page_L-min.jpg';
import Logo from '../../assets/images/Artboard.png';
import Y_axis_logo from '../../assets/images/YoboDataLogo.png';
import { useAuthStateContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Footer from '../../components/Footer';
import { handlePasswordResetEmail } from '../../firebase/firebase';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loadingSpinner, setLoadingSpinner] = useState(false);

  const handleSubmit = async (e) => {
    setLoadingSpinner(true);
    e.preventDefault();
    try {
      const success = await handlePasswordResetEmail(email);

      if (success === true) {
        toast.success('Check your email for further instructions');
        setLoadingSpinner(false);
        return;
      }
    } catch (error) {
      toast.error(error.message);
      setLoadingSpinner(false);
    }
  };

  const classLabel = 'block font-medium text-gray-700 mb-2';
  const classInput =
    'p-2 border bg-slate-100 border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent';

  return (
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

        <div className="grid grid-cols-2 max-w-5xl mx-auto h-[85vh] ">
          <div className="my-auto mr-32 relative">
            {loadingSpinner && <LoadingSpinner />}
            <img className="mx-auto mb-8" width={100} height={100} src={Logo} alt="YuboData Logo" />
            <p className="text-gray-500 text-sm font-semibold mb-5 text-center">
              Enter your email to reset your password.
            </p>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="flex flex-col mb-8">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className={`${classInput}`}
                />
              </div>

              <button
                className="bg-btn1 px-5 block py-2 w-full rounded-xl mb-8 font-semibold text-white hover:shadow-lg transition-all duration-300"
                type="submit"
              >
                Reset Password
              </button>
            </form>
            <div className="flex gap-5 justify-center">
              <p className="font-semibold text-gray-500">Already have an account?</p>
              <Link to={'/login'}>
                <button className="text-btn2 font-medium">Log in</button>
              </Link>
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
        <div className="absolute top-0 right-0 w-12 bg-white  h-full px-2 py-8">
          <img src={Y_axis_logo} alt="Y axis YuboData Logo" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PasswordReset;
