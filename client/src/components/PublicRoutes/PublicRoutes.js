import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStateContext } from '../../contexts/AuthContext';

const PublicRoutes = ({ redirectTo = '/' }) => {
  // check if user is logged in with useContext hook
  const { isLoggedIn } = useAuthStateContext();

  console.log('isLoggedIn: ', isLoggedIn);

  return isLoggedIn ? <Navigate to={redirectTo} replace /> : <Outlet />;
};

export default PublicRoutes;
