import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { analyticsAPI } from '../services/api';
import { Analytics } from '../types';

export default function Analytics() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsAPI.getUserAnalytics(user?.id || '');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">AI Mock Interview Platform - Analytics</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Your Performance Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Interviews</h3>
            <div className="text-4xl font-bold text-blue-600">{analytics?.totalInterviews || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Average Score</h3>
            <div className="text-4xl font-bold text-green-600">{analytics?.averageScore || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Recent Interviews</h3>
            <div className="text-4xl font-bold text-purple-600">{analytics?.recentInterviews?.length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Strong Areas</h3>
            {analytics?.strongAreas && analytics.strongAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.strongAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Complete more interviews to see strong areas</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Areas for Improvement</h3>
            {analytics?.weakAreas && analytics.weakAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.weakAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Complete more interviews to identify weak areas</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Interview History</h3>
          {analytics?.recentInterviews && analytics.recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentInterviews.map((interview, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(interview.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded ${
                          interview.finalScore >= 4 ? 'bg-green-100 text-green-700' :
                          interview.finalScore >= 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {interview.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">{interview.questionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No interviews completed yet</p>
          )}
        </div>
      </div>
    </div>
  );
}