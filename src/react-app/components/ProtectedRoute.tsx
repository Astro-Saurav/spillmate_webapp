import { useAuth } from '@/react-app/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return user ? <Outlet /> : <Navigate to="/" />;
};