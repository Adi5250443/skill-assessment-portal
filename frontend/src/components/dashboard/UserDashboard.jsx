import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await api.getUserReports();
        setReports(data.reports || []);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading your performance data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quizzes Taken</h3>
          <p className="text-3xl font-bold text-indigo-600">{reports.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz History</h3>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No quiz attempts yet. Take your first quiz to see your performance here!
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{report.skill_name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(report.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-indigo-600">{report.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;