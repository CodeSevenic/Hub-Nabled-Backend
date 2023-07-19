import { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStateContext } from '../../contexts/AuthContext';
import Layout from '../Layout/Layout';

const PrivateRoutes = ({ children, activeMenu, themeSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = { pathname: '/login', state: { from: location } };

  const { isLoggedIn, isAdmin } = useAuthStateContext();

  console.log('isLoggedIn: ', isLoggedIn);

  console.log('isAdminSession: ', isAdmin);

  useEffect(() => {
    if (isLoggedIn) {
      if (isAdmin && location.pathname !== '/app-admin') {
        navigate('/app-admin', { replace: true });
      } else if (!isAdmin && location.pathname === '/app-admin') {
        navigate('/', { replace: true });
      } else {
        sessionStorage.setItem('prevUrl', location.pathname);
      }
    }
  }, [isLoggedIn, isAdmin, navigate, location]);

  const prevUrl = sessionStorage.getItem('prevUrl');

  return isLoggedIn ? (
    <Layout activeMenu={activeMenu} themeSettings={themeSettings}>
      {/* <Outlet /> */}
      {children}
    </Layout>
  ) : (
    <Navigate to={prevUrl ? prevUrl : redirectTo} replace />
  );
};

export default PrivateRoutes;
