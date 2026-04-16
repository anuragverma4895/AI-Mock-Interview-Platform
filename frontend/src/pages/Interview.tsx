import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Interview as InterviewData, AnswerEvaluation } from '../types';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/ThemeToggle"
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
        const q = res.data.questions[res.data.currentQuestionIndex];
        setCurrentQuestion(q);
        setConversation([{type: 'ai', text: q.question}]);
        speak(q.question);
        startRecording();
        
        // Auto-start voice listening after a short delay
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
            setListening(true);
          }
        }, 2000);
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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera and microphone access is not supported in this browser.');
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
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      if (!MediaRecorder.isTypeSupported('video/webm')) {
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting recording:', error);
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
      
      // Auto-start voice listening after a short delay
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setListening(true);
        }
      }, 2000);
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
                Question {(interview?.currentQuestionIndex ?? 0) + 1}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className={`transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
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
            className="space-y-6 flex flex-col"
          >
            {/* AI Avatar & Question */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex-1">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    animate={isSpeaking ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-2xl border-4 border-white/20">
                      <span className="text-6xl drop-shadow-lg">🤖</span>
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

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 flex flex-col justify-center"
                  >
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6 text-center">
                      <p className="text-white text-xl leading-relaxed">
                        {currentQuestion?.question}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {!showFeedback && (
                  <div className="space-y-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <div className="flex gap-3">
                      <Button onClick={toggleVoiceInput} variant={listening ? "destructive" : "secondary"}>
                         {listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                         {listening ? 'Stop listening' : 'Record Answer'}
                      </Button>
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={submitting || !answer.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                      >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                      </Button>
                    </div>
                  </div>
                )}

                {showFeedback && evaluation && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-emerald-400">Score: {evaluation.score}/5</h4>
                        <Badge className="bg-emerald-500">{evaluation.score >= 4 ? 'Excellent' : 'Good'}</Badge>
                      </div>
                      <p className="text-white/90 text-sm">{evaluation.feedback}</p>
                    </div>
                    <Button onClick={isLastQuestion ? handleEndInterview : handleNextQuestion} className="w-full bg-indigo-600">
                      {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Video Feed */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden h-full">
               <div className="relative h-full bg-black/40">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraPermissionGranted && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-black/80">
                      Camera access required
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      REC
                    </div>
                  )}
               </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}