import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { interviewAPI, resumeAPI } from '../services/api';
import { Interview, Resume } from '../types';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [interviewsRes, resumesRes] = await Promise.all([
        interviewAPI.getUserInterviews(user?.id || ''),
        resumeAPI.getUserResumes(user?.id || ''),
      ]);
      setInterviews(interviewsRes.data);
      setResumes(resumesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (resumeId?: string) => {
    setStartingInterview(true);
    try {
      const res = await interviewAPI.start(resumeId);
      navigate(`/interview/${res.data.interview.id}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      setStartingInterview(false);
    }
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const inProgressInterviews = interviews.filter(i => i.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">AI Mock Interview Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/resume" className="text-gray-700 hover:text-blue-600">Upload Resume</Link>
              <Link to="/analytics" className="text-gray-700 hover:text-blue-600">Analytics</Link>
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Start New Interview</h2>
            <p className="text-gray-600 mb-4">
              Take a new AI-powered interview to test your technical skills.
            </p>
            {resumes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume (Optional)
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  id="resumeSelect"
                >
                  <option value="">No resume - General questions</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.fileName}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => {
                const select = document.getElementById('resumeSelect') as HTMLSelectElement;
                startInterview(select?.value || undefined);
              }}
              disabled={startingInterview}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {startingInterview ? 'Starting...' : 'Start Interview'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-3xl font-bold text-blue-600">{completedInterviews.length}</div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-3xl font-bold text-yellow-600">{inProgressInterviews.length}</div>
                <div className="text-gray-600">In Progress</div>
              </div>
            </div>
            {completedInterviews.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  Average Score: {
                    (completedInterviews.reduce((sum, i) => sum + (i.finalScore || 0), 0) / completedInterviews.length).toFixed(1)
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Interviews</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No interviews yet. Start your first interview!</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {interviews.slice(0, 10).map(interview => (
                    <tr key={interview._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{interview.questions.length}</td>
                      <td className="px-6 py-4">
                        {interview.finalScore ? interview.finalScore.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.status === 'completed' && (
                          <Link
                            to={`/interview-result/${interview._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Result
                          </Link>
                        )}
                        {interview.status === 'in_progress' && (
                          <Link
                            to={`/interview/${interview._id}`}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Continue
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Uploaded Resumes</h2>
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No resumes uploaded. 
              <Link to="/resume" className="text-blue-600 hover:underline ml-1">Upload one now</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resumes.map(resume => (
                <div key={resume._id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium">{resume.fileName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {resume.parsedData.skills?.length || 0} skills detected
                  </p>
                  <p className="text-sm text-gray-500">
                    {resume.parsedData.projects?.length || 0} projects detected
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}