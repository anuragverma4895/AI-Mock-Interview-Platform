import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { interviewAPI, videoAPI } from '../services/api';
import { Interview, AnswerEvaluation } from '../types';

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadInterview();
    startCamera();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, []);

  const loadInterview = async () => {
    try {
      const res = await interviewAPI.getInterview(id!);
      setInterview(res.data);
      if (res.data.questions[res.data.currentQuestionIndex]) {
        setCurrentQuestion(res.data.questions[res.data.currentQuestionIndex]);
      }
      setTimeLeft((res.data.duration || 45) * 60);
    } catch (error) {
      console.error('Error loading interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);

    try {
      const finalAnswer = showCodeEditor ? `${answer}\n\nCode:\n${code}` : answer;
      const res = await interviewAPI.submitAnswer(id!, finalAnswer);
      setEvaluation(res.data.evaluation);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setLoading(true);
    setAnswer('');
    setEvaluation(null);
    setShowCodeEditor(false);
    setCode('');

    try {
      const res = await interviewAPI.getNextQuestion(id!);
      setCurrentQuestion(res.data.question);
    } catch (error) {
      console.error('Error getting next question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    stopRecording();
    
    let videoPath: string | undefined;
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, 'interview.webm');
      
      try {
        await interviewAPI.endInterview(id!, videoPath, {
          confidenceScore: 75,
          suggestions: ['Good eye contact', 'Maintain posture'],
        });
      } catch (error) {
        console.error('Error ending interview:', error);
      }
    }

    navigate(`/interview-result/${id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-red-600">
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-600">
              Question {interview?.currentQuestionIndex + 1 || 1} of 15
            </div>
          </div>
          <button
            onClick={handleEndInterview}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion?.difficulty}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {currentQuestion?.category}
                  </span>
                </div>
                <button
                  onClick={toggleRecording}
                  className={`px-3 py-1 rounded text-white ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-4">{currentQuestion?.question}</h3>

              {!evaluation ? (
                <div>
                  <button
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="mb-2 text-sm text-blue-600 hover:underline"
                  >
                    {showCodeEditor ? 'Hide Code Editor' : 'Show Code Editor'}
                  </button>
                  
                  {showCodeEditor && (
                    <div className="mb-4">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 mr-2"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                      </select>
                      <Editor
                        height="300px"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                      />
                    </div>
                  )}

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-40 border border-gray-300 rounded p-3"
                  />

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded">
                    <div className="font-semibold">Score: {evaluation.score}/5</div>
                    <p className="mt-2">{evaluation.feedback}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Strengths:</h4>
                    <ul className="list-disc list-inside">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-green-600">{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">Areas for Improvement:</h4>
                    <ul className="list-disc list-inside">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i} className="text-orange-600">{imp}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Camera Preview</h3>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full bg-black rounded"
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((interview?.currentQuestionIndex || 0) / 15) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {interview?.currentQuestionIndex || 0} of 15 questions completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}