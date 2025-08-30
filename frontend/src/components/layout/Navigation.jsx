import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, BookOpen, Users, Settings } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  
  const userTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'quiz', label: 'Take Quiz', icon: BookOpen },
  ];
  
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'questions', label: 'Questions', icon: Settings },
  ];
  
  const tabs = user.role === 'admin' ? adminTabs : userTabs;
  
  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;