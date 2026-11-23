import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Interview } from '../types';
import InterviewConversation from '../components/InterviewConversation';
import {
  ArrowLeft,
  Download,
  Eye,
  Lightbulb,
  Video,
  Code2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function InterviewResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const analysisRequestRef = useRef(false);

  const loadInterview = useCallback(async () => {
    try {
      const res = await interviewAPI.getInterview(id!);
      setInterview(res.data);
      return res.data;
    } catch (error) {
      console.error('Error loading interview:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  useEffect(() => {
    if (loading || interview?.recordingStatus !== 'pending') return;

    setRecordingLoading(true);
    let attempts = 0;
    const maxAttempts = 15; // Avoid polling indefinitely if upload cannot finish
    const interval = window.setInterval(async () => {
      attempts += 1;
      try {
        const res = await interviewAPI.getInterview(id!);
        setInterview(res.data);
        if (res.data.recordingStatus !== 'pending' || attempts >= maxAttempts) {
          window.clearInterval(interval);
          setRecordingLoading(false);
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          window.clearInterval(interval);
          setRecordingLoading(false);
        }
      }
    }, 2000);

    return () => {
      window.clearInterval(interval);
      setRecordingLoading(false);
    };
  }, [loading, interview?.recordingStatus, id]);

  const requestEvaluation = useCallback(async () => {
    if (!id || analysisRequestRef.current) return;
    analysisRequestRef.current = true;
    setAnalysisLoading(true);
    try {
      await interviewAPI.evaluateInterview(id);
      await loadInterview();
      setAnalysisError('');
    } catch (error) {
      console.error('Unable to generate final feedback:', error);
      setAnalysisError('Feedback could not be generated. Your answers are safely saved. Please retry.');
    } finally {
      analysisRequestRef.current = false;
      setAnalysisLoading(false);
    }
  }, [id, loadInterview]);

  useEffect(() => {
    if (loading || interview?.status !== 'completed' || interview?.interviewType === 'coding' ||
        !interview?.evaluationStatus || interview.evaluationStatus === 'completed' || analysisError) return;
    // Start or resume DB-backed evaluation; poll while another request is processing.
    void requestEvaluation();
    const interval = window.setInterval(() => { void requestEvaluation(); }, 5000);
    return () => window.clearInterval(interval);
  }, [loading, interview?.status, interview?.interviewType, interview?.evaluationStatus, analysisError, requestEvaluation]);

  // Video URL comes directly from Cloudinary (recordingUrl field)
  const videoUrl = interview?.recordingUrl || null;
  const finalScore = interview?.finalScore;
  const finalScoreLabel = (interview?.interviewType === 'coding' || !interview?.evaluationStatus || interview.evaluationStatus === 'completed') && typeof finalScore === 'number' ? finalScore.toFixed(1) : '—';

  const downloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.setAttribute('download', `interview-${id}.webm`);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
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
        <div className="w-full max-w-[1760px] mx-auto px-3 sm:px-6">
          <div className="flex flex-wrap justify-between items-center gap-3 min-h-20 py-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PrepVerse - Results</h1>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 inline h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 py-5 lg:py-8">
        {interview?.evaluationStatus && interview.evaluationStatus !== 'completed' && interview.interviewType !== 'coding' && (
          <div role="status" className="mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4 sm:p-5 flex flex-wrap justify-between gap-3 items-center">
            <div>
              <h2 className="text-lg font-bold text-indigo-950">
                {analysisLoading ? 'Preparing your interview feedback...' : 'Feedback analysis is pending'}
              </h2>
              <p className="text-sm text-indigo-700 mt-1">
                {analysisError || 'Your answers are stored. Detailed Gemini evaluation and marks will appear here when ready.'}
              </p>
            </div>
            {analysisError && (
              <button onClick={() => { setAnalysisError(''); void requestEvaluation(); }}
                className="rounded-lg bg-indigo-600 text-white font-semibold px-4 py-2 hover:bg-indigo-700">
                Retry evaluation
              </button>
            )}
          </div>
        )}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl border border-white/50 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Interview Results</h2>
            {videoUrl && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  <Video className="mr-2 inline h-5 w-5" />
                  Saved in Profile
                </button>
                <button
                  onClick={downloadVideo}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  <Download className="mr-2 inline h-5 w-5" />
                  Download Video
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center shadow-lg border border-blue-200/50 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {finalScoreLabel}
              </div>
              <div className="text-blue-700 font-semibold text-lg">Final Score</div>
              <div className="text-blue-500 text-sm mt-1">Out of 5.0</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl text-center shadow-lg border border-emerald-200/50 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                {interview?.interviewType === 'coding'
                  ? `${interview.codingPassedCount || 0}/${interview.codingTotalCount || 0}`
                  : (interview?.questions.filter(q => Boolean(q.answer?.trim())).length || 0)}
              </div>
              <div className="text-emerald-700 font-semibold text-lg">
                {interview?.interviewType === 'coding'
                  ? (interview.codingEvaluationMethod === 'browser_js' ? 'Browser Tests Passed' : interview.codingEvaluationMethod === 'judge0' ? 'Compiler Tests Passed' : 'AI-Estimated Passes')
                  : 'Questions Answered'}
              </div>
              <div className="text-emerald-500 text-sm mt-1">
                {interview?.interviewType === 'coding'
                  ? (interview.codingEvaluationMethod === 'browser_js'
                    ? 'Executed in your browser for practice; not a verified judge'
                    : interview.codingEvaluationMethod === 'judge0'
                      ? 'Executed in an isolated compiler; results based on visible test cases'
                      : 'Legacy AI-estimated review')
                  : 'Total Questions'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center shadow-lg border border-purple-200/50 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                {interview?.duration || 0}
              </div>
              <div className="text-purple-700 font-semibold text-lg">Minutes</div>
              <div className="text-purple-500 text-sm mt-1">Interview Duration</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <Video className="h-7 w-7 text-blue-600" /> Review Your Interview
            </h3>
            {videoUrl ? (
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
                <video controls className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border border-white/30">
                  <source src={videoUrl} type="video/webm" />
                  <source src={videoUrl.replace(/\.webm$/, '.mp4')} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="text-slate-600 mt-4 text-center font-medium">Watch your responses to identify areas for improvement</p>
              </div>
            ) : recordingLoading ? (
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-700 font-semibold text-lg">Saving your recording...</span>
                </div>
                <p className="text-blue-600">This may take a minute for longer interviews. Please wait.</p>
              </div>
            ) : (
              <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-600 mb-4">Recording is not available for this interview. The full answer analysis is shown below.</p>
                <button
                  onClick={async () => {
                    setRecordingLoading(true);
                    const data = await loadInterview();
                    if (!data?.recordingUrl) {
                      setTimeout(() => setRecordingLoading(false), 1000);
                    }
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Retry Loading Recording
                </button>
              </div>
            )}
          </div>

          {interview?.bodyLanguageData && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl mb-8 border border-amber-200/50 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-amber-800 flex items-center gap-3">
                <Eye className="h-7 w-7 text-amber-700" /> Body Language Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/60 p-6 rounded-xl text-center shadow-md border border-amber-200/30">
                  <div className="text-4xl font-black text-amber-600 mb-2">{interview.bodyLanguageData.eyeContact}%</div>
                  <div className="text-amber-700 font-semibold">Eye Contact</div>
                  <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{width: `${interview.bodyLanguageData.eyeContact}%`}}></div>
                  </div>
                </div>
                <div className="bg-white/60 p-6 rounded-xl text-center shadow-md border border-amber-200/30">
                  <div className="text-4xl font-black text-amber-600 mb-2">{interview.bodyLanguageData.faceOrientation}%</div>
                  <div className="text-amber-700 font-semibold">Face Orientation</div>
                  <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{width: `${interview.bodyLanguageData.faceOrientation}%`}}></div>
                  </div>
                </div>
                <div className="bg-white/60 p-6 rounded-xl text-center shadow-md border border-amber-200/30">
                  <div className="text-4xl font-black text-amber-600 mb-2">{interview.bodyLanguageData.confidenceScore}%</div>
                  <div className="text-amber-700 font-semibold">Confidence</div>
                  <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{width: `${interview.bodyLanguageData.confidenceScore}%`}}></div>
                  </div>
                </div>
              </div>
              {interview.bodyLanguageData.suggestions.length > 0 && (
                <div className="bg-white/40 p-6 rounded-xl border border-amber-200/30">
                  <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" /> Suggestions for Improvement:
                  </h4>
                  <ul className="space-y-2">
                    {interview.bodyLanguageData.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-amber-700">
                        <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {interview?.interviewType === 'coding' && interview.codingResults && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-2xl mb-8 border border-emerald-200/50 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center gap-3">
                <Code2 className="h-7 w-7 text-emerald-700" /> Coding Challenge Results
              </h3>
              {interview.codingChallenge && (
                <div className="bg-white/60 p-6 rounded-xl mb-6 border border-emerald-200/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-emerald-900 text-lg">{interview.codingChallenge.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      interview.codingChallenge.difficulty === 'easy' ? 'bg-yellow-100 text-yellow-700' :
                      interview.codingChallenge.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {interview.codingChallenge.difficulty}
                    </span>
                  </div>
                  <p className="text-emerald-800 text-sm mb-3">{interview.codingChallenge.description}</p>
                  <div className="flex items-center gap-4 text-xs text-emerald-700">
                    <span>Language: {interview.codingChallenge.language}</span>
                    <span>Test Cases: {interview.codingResults.length}</span>
                    <span>Passed: {interview.codingPassedCount || 0}/{interview.codingTotalCount || 0}</span>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {interview.codingResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      result.passed
                        ? 'bg-white/60 border-emerald-300'
                        : 'bg-white/40 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">Test Case {index + 1}</span>
                      {result.passed ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium text-slate-700">Input:</span> <code className="text-slate-600">{result.input}</code></div>
                      <div><span className="font-medium text-slate-700">Expected:</span> <code className="text-slate-600">{result.expected}</code></div>
                      {!result.passed && (
                        <div><span className="font-medium text-slate-700">Actual:</span> <code className="text-red-600">{result.actual}</code></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <InterviewConversation questions={interview?.questions || []} variant="light" revealScores />
        </div>
      </div>
    </div>
  );
}
