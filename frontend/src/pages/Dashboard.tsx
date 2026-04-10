<<<<<<< HEAD
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  Home,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Plus,
  Play,
  Calendar,
  Target,
  Award,
  Clock,
  Star
} from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mock data - in real app this would come from API
  const stats = {
    totalInterviews: 24,
    averageScore: 4.2,
    completionRate: 85,
    studyStreak: 12
  }

  const recentInterviews = [
    {
      id: 1,
      type: "Technical",
      score: 4.5,
      date: "2024-01-15",
      duration: "45 min",
      status: "completed"
    },
    {
      id: 2,
      type: "Behavioral",
      score: 3.8,
      date: "2024-01-12",
      duration: "30 min",
      status: "completed"
    },
    {
      id: 3,
      type: "System Design",
      score: 4.1,
      date: "2024-01-10",
      duration: "60 min",
      status: "completed"
    }
  ]

  const performanceData = [
    { month: "Jan", score: 3.5, interviews: 4 },
    { month: "Feb", score: 3.8, interviews: 6 },
    { month: "Mar", score: 4.1, interviews: 8 },
    { month: "Apr", score: 4.3, interviews: 6 }
  ]

  const weakAreas = [
    { area: "System Design", score: 3.2, color: "#ef4444" },
    { area: "Data Structures", score: 3.8, color: "#f59e0b" },
    { area: "Algorithms", score: 4.1, color: "#10b981" },
    { area: "Behavioral", score: 4.5, color: "#3b82f6" }
  ]

  const interviewTypes = [
    { name: "Technical", value: 12, color: "#3b82f6" },
    { name: "Behavioral", value: 6, color: "#10b981" },
    { name: "System Design", value: 4, color: "#f59e0b" },
    { name: "HR", value: 2, color: "#ef4444" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <SidebarItem icon={<Home />} isActive={true}>
            {!sidebarCollapsed && "Dashboard"}
          </SidebarItem>
          <SidebarItem icon={<Play />} onClick={() => navigate('/interview')}>
            {!sidebarCollapsed && "Start Interview"}
          </SidebarItem>
          <SidebarItem icon={<FileText />} onClick={() => navigate('/resume')}>
            {!sidebarCollapsed && "Resume Analysis"}
          </SidebarItem>
          <SidebarItem icon={<TrendingUp />} onClick={() => navigate('/analytics')}>
            {!sidebarCollapsed && "Analytics"}
          </SidebarItem>
          <SidebarItem icon={<Users />} onClick={() => navigate('/profile')}>
            {!sidebarCollapsed && "Profile"}
          </SidebarItem>
          <SidebarItem icon={<Settings />} onClick={() => navigate('/settings')}>
            {!sidebarCollapsed && "Settings"}
          </SidebarItem>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300">
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 p-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Welcome back, Developer! 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Ready to ace your next interview?
                </p>
              </div>
              <Button
                onClick={() => navigate('/interview')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start New Interview
              </Button>
            </div>
          </motion.header>

          {/* Content */}
          <main className="p-6 space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Interviews
                  </CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalInterviews}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Average Score
                  </CardTitle>
                  <Star className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {stats.averageScore}/5
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    +0.3 from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Completion Rate
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.completionRate}%
                  </div>
                  <Progress value={stats.completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Study Streak
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.studyStreak} days
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Keep it up! 🔥
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Over Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Interview Types Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Interview Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={interviewTypes}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {interviewTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {interviewTypes.map((type, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {type.name}: {type.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Interviews & Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Interviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{interview.type}</p>
                            <p className="text-sm text-slate-500">
                              {interview.date} • {interview.duration}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="success" className="mb-1">
                              {interview.score}/5
                            </Badge>
                            <p className="text-xs text-slate-500">
                              {interview.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate('/analytics')}
                    >
                      View All Interviews
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Areas for Improvement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weakAreas.map((area, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{area.area}</span>
                            <span className="text-sm text-slate-500">
                              {area.score}/5
                            </span>
                          </div>
                          <Progress
                            value={(area.score / 5) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate('/analytics')}
                    >
                      Get Detailed Analysis
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
=======
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
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
}