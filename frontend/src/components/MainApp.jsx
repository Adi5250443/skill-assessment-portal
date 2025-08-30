import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './auth/Login';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import Dashboard from './dashboard/Dashboard';
import Quiz from './quiz/Quiz';
import UsersManagement from './admin/UsersManagement';
import QuestionsManagement from './admin/QuestionsManagement';
import LoadingSpinner from './common/LoadingSpinner';
import { BookOpen } from 'lucide-react';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'quiz':
        return <Quiz />;
      case 'users':
        return <UsersManagement />;
      case 'questions':
        return <QuestionsManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainApp;