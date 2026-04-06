import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, videoAPI } from '../services/api';
import { Interview } from '../types';

export default function InterviewResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterview();
  }, []);

  const loadInterview = async () => {
    try {
      const res = await interviewAPI.getInterview(id!);
      setInterview(res.data);
    } catch (error) {
      console.error('Error loading interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async () => {
    try {
      const response = await videoAPI.downloadVideo(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview-${id}.webm`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">AI Interview Bot - Results</h1>
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
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Interview Results</h2>
            {interview?.videoPath && (
              <button
                onClick={downloadVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download Video
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded text-center">
              <div className="text-3xl font-bold text-blue-600">
                {interview?.finalScore?.toFixed(1) || '-'}
              </div>
              <div className="text-gray-600">Final Score</div>
            </div>
            <div className="bg-green-50 p-4 rounded text-center">
              <div className="text-3xl font-bold text-green-600">
                {interview?.questions.length || 0}
              </div>
              <div className="text-gray-600">Questions Answered</div>
            </div>
            <div className="bg-purple-50 p-4 rounded text-center">
              <div className="text-3xl font-bold text-purple-600">
                {interview?.duration || 0} min
              </div>
              <div className="text-gray-600">Duration</div>
            </div>
          </div>

          {interview?.bodyLanguageData && (
            <div className="bg-yellow-50 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">Body Language Analysis</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{interview.bodyLanguageData.eyeContact}%</div>
                  <div className="text-sm text-gray-600">Eye Contact</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{interview.bodyLanguageData.faceOrientation}%</div>
                  <div className="text-sm text-gray-600">Face Orientation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{interview.bodyLanguageData.confidenceScore}%</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
              {interview.bodyLanguageData.suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium">Suggestions:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {interview.bodyLanguageData.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Question-wise Breakdown</h3>
          <div className="space-y-4">
            {interview?.questions.map((q, i) => (
              <div key={i} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm text-gray-500">Q{i + 1}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="ml-1 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                      {q.category}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    {q.score !== undefined ? `${q.score}/5` : 'Pending'}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{q.question}</p>
                {q.answer && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <strong>Your Answer:</strong> {q.answer.substring(0, 200)}...
                  </div>
                )}
                {q.feedback && (
                  <div className="mt-2 text-sm text-green-700">
                    <strong>Feedback:</strong> {q.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}