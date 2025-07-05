import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

function AdminRoute({ children }) {
  const user = useStore(state => state.user);

  // Check if user is logged in and if user's name or email contains "sikha"
  const isAdmin = user && (user.name?.toLowerCase() === 'sikha' || user.email?.toLowerCase() === 'shikhakumari08998@gmail.com'); 
  // Replace 'sikha@example.com' with your actual admin email if needed

  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
