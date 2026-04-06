import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
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
  const [greeting, setGreeting] = useState('');
  const [closingMessage, setClosingMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'ai' | 'user', text: string}>>([]);
  const [listening, setListening] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAnswer(prev => prev + ' ' + transcript);
        setListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setListening(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const loadInterview = async () => {
    try {
      const res = await interviewAPI.getInterview(id!);
      setInterview(res.data);
      if (res.data.questions[res.data.currentQuestionIndex]) {
        setCurrentQuestion(res.data.questions[res.data.currentQuestionIndex]);
        const q = res.data.questions[res.data.currentQuestionIndex];
        setConversation([{type: 'ai', text: q.question}]);
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

  const toggleVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);

    setConversation(prev => [...prev, {type: 'user', text: answer}]);

    try {
      const res = await interviewAPI.submitAnswer(id!, answer);
      setEvaluation(res.data.evaluation);
      setIsLastQuestion(res.data.isLastQuestion || false);
      setShowFeedback(true);
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
    setShowFeedback(false);

    try {
      const res = await interviewAPI.getNextQuestion(id!);
      setCurrentQuestion(res.data.question);
      setConversation(prev => [...prev, {type: 'ai', text: res.data.question.question}]);
      speak(res.data.question.question);
    } catch (error) {
      console.error('Error getting next question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    stopRecording();
    
    try {
      const res = await interviewAPI.endInterview(id!, undefined, {
        confidenceScore: 75,
        suggestions: ['Good eye contact', 'Maintain posture'],
      });
      setClosingMessage(res.data.closingMessage);
      setTimeout(() => navigate(`/interview-result/${id}`), 3000);
    } catch (error) {
      console.error('Error ending interview:', error);
      navigate(`/interview-result/${id}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (closingMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-lg text-center shadow-2xl">
          <div className="text-6xl mb-4">&#x1F44B;</div>
          <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
          <p className="text-gray-600">{closingMessage}</p>
          <p className="mt-4 text-sm text-gray-500">Redirecting to results...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Setting up your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-red-500">
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-400">
              Question {interview?.currentQuestionIndex + 1 || 1} of 10
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-green-500'} flex items-center space-x-2`}
            >
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'animate-pulse bg-white' : 'bg-white'}`}></span>
              <span>{isRecording ? 'Recording' : 'Start Recording'}</span>
            </button>
            <button
              onClick={handleEndInterview}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Avatar Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {/* AI Avatar */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-5xl ${isSpeaking ? 'animate-pulse' : ''}`}>
                    <span className="text-6xl">&#x1F464;</span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-800"></div>
                  {isSpeaking && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      <span className="w-1 h-4 bg-blue-500 animate-pulse"></span>
                      <span className="w-1 h-3 bg-blue-500 animate-pulse"></span>
                      <span className="w-1 h-5 bg-blue-500 animate-pulse"></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Display */}
              <div className="bg-gray-700 rounded-xl p-6 mb-6 min-h-[120px]">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">&#x1F4AC;</span>
                  <div className="flex-1">
                    <p className="text-lg">{currentQuestion?.question}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        currentQuestion?.difficulty === 'easy' ? 'bg-green-600' :
                        currentQuestion?.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {currentQuestion?.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-blue-600">
                        {currentQuestion?.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              {!showFeedback ? (
                <div className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Speak your answer or type here..."
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={toggleVoiceInput}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${listening ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <span>{listening ? '&#x23F9;' : '&#x1F3A4;'}</span>
                      <span>{listening ? 'Stop' : 'Voice Input'}</span>
                    </button>
                    
                    <button
                      onClick={() => speak(currentQuestion?.question)}
                      className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <span>&#x1F50A;</span>
                      <span>Read Aloud</span>
                    </button>
                    
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                      className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold">Score</span>
                      <span className="text-3xl font-bold">{evaluation?.score}/5</span>
                    </div>
                    <p className="text-white/90">{evaluation?.feedback}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                      <ul className="text-sm text-gray-300">
                        {evaluation?.strengths.map((s, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-green-400">&#x2713;</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-orange-400 font-semibold mb-2">Improvements</h4>
                      <ul className="text-sm text-gray-300">
                        {evaluation?.improvements.map((imp, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-orange-400">&#x2022;</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {evaluation?.followUpQuestion && (
                    <div className="bg-blue-600/30 border border-blue-500 rounded-lg p-4">
                      <p className="text-sm text-blue-300">Follow-up: {evaluation.followUpQuestion}</p>
                    </div>
                  )}

                  <button
                    onClick={isLastQuestion ? handleEndInterview : handleNextQuestion}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold"
                  >
                    {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-gray-400 text-sm mb-2">Your Camera</h3>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-48 object-cover rounded-lg bg-black"
              />
              <div className="flex justify-center mt-3">
                <button
                  onClick={toggleRecording}
                  className={`w-12 h-12 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-600'} flex items-center justify-center`}
                >
                  <span className="text-white text-xl">&#x23F8;</span>
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-gray-400 text-sm mb-3">Interview Progress</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${((interview?.currentQuestionIndex || 0) / 10) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {interview?.currentQuestionIndex || 0} of 10 questions completed
              </p>
            </div>

            {/* Conversation History */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-h-64 overflow-y-auto">
              <h3 className="text-gray-400 text-sm mb-3">Conversation</h3>
              <div className="space-y-3">
                {conversation.slice(-6).map((msg, i) => (
                  <div key={i} className={`text-sm ${msg.type === 'ai' ? 'text-blue-300' : 'text-green-300'}`}>
                    <span className="font-semibold">{msg.type === 'ai' ? 'Alex: ' : 'You: '}</span>
                    {msg.text.substring(0, 80)}...
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}