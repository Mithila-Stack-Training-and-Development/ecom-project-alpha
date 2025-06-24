import { Navigate } from 'react-router-dom';
  import useStore from '../store/useStore';

  const ProtectedRoute = ({ children }) => {
    const { user } = useStore();
    const token = localStorage.getItem('token');

    if (!user || !token) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  export default ProtectedRoute;