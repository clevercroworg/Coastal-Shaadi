import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userProfileStr = localStorage.getItem('userProfile');
  if (!token || !userProfileStr) {
    // Redirect them to the login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const userProfile = JSON.parse(userProfileStr);
    if (userProfile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (userProfile.status !== 'approved') {
      return <Navigate to="/pending" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
