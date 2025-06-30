import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

const AdminProtectedRoute = ({ children }) => {
  const { admin } = useStore();
  const adminToken = localStorage.getItem('adminToken');

  if (!admin || !adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
