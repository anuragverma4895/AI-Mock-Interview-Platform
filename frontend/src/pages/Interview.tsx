import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Interview as InterviewData, AnswerEvaluation } from '../types';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Square,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle
} from "lucide-react"

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [closingMessage, setClosingMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'ai' | 'user', text: string}>>([]);
  const [listening, setListening] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

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
        speak(q.question);
        startRecording();
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
      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera and microphone access is not supported in this browser. Please use a modern browser like Chrome or Firefox.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermissionGranted(true);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera and microphone. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera and microphone access is not supported.';
      } else {
        errorMessage += 'Please check your device settings and try again.';
      }

      alert(errorMessage);
      setCameraPermissionGranted(false);
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
    if (!cameraPermissionGranted) {
      alert('Camera permission is required to record video. Please allow camera access first.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        alert('Video recording is not supported in this browser. Please use Chrome or Firefox.');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('An error occurred during recording. Please try again.');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check camera permissions.');
      setIsRecording(false);
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
      startRecording();
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4"
      >
        <Card className="bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl max-w-lg w-full">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold mb-6 text-white">Interview Complete!</h2>
            <p className="text-white/90 text-lg leading-relaxed mb-6">{closingMessage}</p>
            <p className="text-white/70 font-medium">Redirecting to results...</p>
            <div className="mt-6 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
          >
            Setting up your interview...
          </motion.h2>
          <p className="text-white/70 text-lg">Preparing your AI interviewer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/80">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Question {(interview?.currentQuestionIndex ?? 0) + 1} of 10
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className={`transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'}`}
            >
              {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              {isRecording ? 'Complete Recording' : 'Start Recording'}
            </Button>
            <Button
              onClick={handleEndInterview}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              End Interview
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-120px)]">
          {/* Left Panel - AI Interaction */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* AI Avatar & Question */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex-1">
              <CardContent className="p-8 h-full flex flex-col">
                {/* AI Avatar */}
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    animate={isSpeaking ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-2xl border-4 border-white/20">
                      <span className="text-6xl drop-shadow-lg">🤖</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-400 w-6 h-6 rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center">
                      <Mic className="h-3 w-3 text-white" />
                    </div>
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-1"
                      >
                        <div className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" />
                        <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-1 h-5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Question Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 flex flex-col justify-center"
                  >
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <MessageCircle className="h-6 w-6 text-blue-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-white text-lg leading-relaxed mb-4">
                            {currentQuestion?.question}
                          </p>
                          <div className="flex gap-3">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                              {currentQuestion?.category}
                            </Badge>
                            <Badge
                              variant={currentQuestion?.difficulty === 'easy' ? 'success' : currentQuestion?.difficulty === 'medium' ? 'warning' : 'destructive'}
                              className="capitalize"
                            >
                              {currentQuestion?.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Answer Input */}
                <AnimatePresence>
                  {!showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here, or use voice input..."
                        className="w-full h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white placeholder-white/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={toggleVoiceInput}
                          variant={listening ? "destructive" : "secondary"}
                          className="flex items-center gap-2"
                        >
                          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {listening ? 'Stop Voice' : 'Voice Input'}
                        </Button>

                        <Button
                          onClick={() => speak(currentQuestion?.question)}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          🔊 Read Question
                        </Button>

                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={submitting || !answer.trim()}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Submit Answer
                            </div>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Feedback Display */}
                <AnimatePresence>
                  {showFeedback && evaluation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      {/* Score Card */}
                      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 border-0 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Your Score</h3>
                            <div className="text-4xl font-black text-white">{evaluation.score}/5</div>
                          </div>
                          <p className="text-white/95 text-lg">{evaluation.feedback}</p>
                        </CardContent>
                      </Card>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="bg-white/10 backdrop-blur-sm border border-emerald-400/20">
                          <CardContent className="p-6">
                            <h4 className="text-emerald-300 font-bold mb-4 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 text-white/90">
                              {evaluation.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="text-emerald-400 text-lg mt-1">✨</span>
                                  <span className="text-sm leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-sm border border-amber-400/20">
                          <CardContent className="p-6">
                            <h4 className="text-amber-300 font-bold mb-4 flex items-center gap-2">
                              <XCircle className="h-5 w-5" />
                              Areas to Improve
                            </h4>
                            <ul className="space-y-2 text-white/90">
                              {evaluation.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="text-amber-400 text-lg mt-1">💡</span>
                                  <span className="text-sm leading-relaxed">{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Follow-up Question */}
                      {evaluation.followUpQuestion && (
                        <Card className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-sm border border-blue-400/30">
                          <CardContent className="p-6">
                            <p className="text-blue-200 font-semibold flex items-center gap-2">
                              <span className="text-xl">🎯</span>
                              Follow-up: {evaluation.followUpQuestion}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Next Action */}
                      <Button
                        onClick={isLastQuestion ? handleEndInterview : handleNextQuestion}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 py-4 text-lg font-bold"
                      >
                        {isLastQuestion ? '🎉 Finish Interview' : '➡️ Next Question'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - User Video & Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* User Video */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Your Camera
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMicEnabled(!micEnabled)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isRecording && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full shadow-lg"
                    />
                  )}
                  {!cameraEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <VideoOff className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress & Status */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm">Interview Progress</span>
                    <span className="text-white font-semibold">
                      {(interview?.currentQuestionIndex ?? 0) + 1} / 10
                    </span>
                  </div>
                    <Progress
                      value={(((interview?.currentQuestionIndex ?? 0) + 1) / 10) * 100}
                      className="h-2"
                    />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Interview Progress</span>
                    <span className="text-white font-semibold">
                      {(interview?.currentQuestionIndex ?? 0) + 1} / 10
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversation History */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex-1">
              <CardContent className="p-4 h-64">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversation
                </h3>
                <div className="space-y-3 overflow-y-auto h-full">
                  {conversation.slice(-5).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.type === 'ai' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg text-sm ${
                        msg.type === 'ai'
                          ? 'bg-blue-600/30 border border-blue-400/30 text-blue-200'
                          : 'bg-emerald-600/30 border border-emerald-400/30 text-emerald-200 ml-auto max-w-xs'
                      }`}
                    >
                      <div className="font-semibold text-xs mb-1">
                        {msg.type === 'ai' ? '🤖 InterviewAI' : '👤 You'}
                      </div>
                      {msg.text}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}