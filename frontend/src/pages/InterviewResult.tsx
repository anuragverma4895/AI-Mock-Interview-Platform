import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, videoAPI } from '../services/api';
import { Interview } from '../types';

export default function InterviewResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInterview();
    loadVideo();
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

  const loadVideo = async () => {
    try {
      const response = await videoAPI.downloadVideo(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setVideoUrl(url);
    } catch (error) {
      console.error('Error loading video:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Loading results...</div>
          <div className="text-slate-600 mt-2">Analyzing your interview performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Interview Results</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Performance Summary</h2>
            {interview?.videoPath && (
              <button
                onClick={downloadVideo}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600"
              >
                📥 Download Recording
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-8 rounded-2xl text-center border border-blue-200">
              <div className="text-5xl font-black text-blue-600 mb-2">
                {interview?.finalScore?.toFixed(1) || '-'}
              </div>
              <div className="text-blue-700 font-semibold">Final Score</div>
            </div>
            <div className="bg-emerald-50 p-8 rounded-2xl text-center border border-emerald-200">
              <div className="text-5xl font-black text-emerald-600 mb-2">
                {interview?.questions.length || 0}
              </div>
              <div className="text-emerald-700 font-semibold">Questions</div>
            </div>
            <div className="bg-purple-50 p-8 rounded-2xl text-center border border-purple-200">
              <div className="text-5xl font-black text-purple-600 mb-2">
                {interview?.duration || 0}
              </div>
              <div className="text-purple-700 font-semibold">Minutes</div>
            </div>
          </div>

          {videoUrl && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Review Session</h3>
              <video controls className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl border border-white/30">
                <source src={videoUrl} type="video/webm" />
              </video>
            </div>
          )}

          {interview?.bodyLanguageData && (
            <div className="bg-amber-50 p-8 rounded-2xl mb-8 border border-amber-200">
              <h3 className="text-2xl font-bold mb-6 text-amber-800">Body Language Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{interview.bodyLanguageData.eyeContact}%</div>
                  <div className="text-sm text-amber-700">Eye Contact</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{interview.bodyLanguageData.faceOrientation}%</div>
                  <div className="text-sm text-amber-700">Face Orientation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{interview.bodyLanguageData.confidenceScore}%</div>
                  <div className="text-sm text-amber-700">Confidence</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          <h3 className="text-2xl font-bold mb-6">Detailed Feedback</h3>
          <div className="space-y-6">
            {interview?.questions.map((q, i) => (
              <div key={i} className="border border-slate-200 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-bold text-slate-600">Question {i + 1}</span>
                  <div className="text-xl font-bold">{q.score}/5</div>
                </div>
                <p className="font-medium text-lg mb-4">{q.question}</p>
                {q.feedback && (
                  <div className="bg-emerald-50 p-4 rounded-xl text-emerald-700 text-sm">
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