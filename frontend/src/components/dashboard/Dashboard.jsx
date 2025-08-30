import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;