import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {ClockLoader} from "react-spinners"

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading,isAuthenticated } = useAuth();

  return isLoading ? <><ClockLoader loading={true} /></> : isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
export default PrivateRoute;