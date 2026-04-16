import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from '../store/authStore'
import { interviewAPI, resumeAPI } from '../services/api'
import { Interview, Resume } from '../types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import { AnimatedCard3D } from "@/components/AnimatedCard3D"
import { ThemeToggle } from "@/components/ThemeToggle"
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
  Star,
  LogOut,
  Zap
} from "lucide-react"

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [interviewsRes, resumesRes] = await Promise.all([
        interviewAPI.getUserInterviews(user?.id || ''),
        resumeAPI.getUserResumes(user?.id || ''),
      ])
      setInterviews(interviewsRes.data)
      setResumes(resumesRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = () => {
    navigate('/interview-setup')
  }

  const completedInterviews = interviews.filter(i => i.status === 'completed')
  const avgScore = completedInterviews.length > 0 
    ? (completedInterviews.reduce((sum, i) => sum + (i.finalScore || 0), 0) / completedInterviews.length).toFixed(1)
    : "0.0"

  const performanceData = completedInterviews.map((int, idx) => ({
    name: `Int ${idx + 1}`,
    score: int.finalScore || 0
  })).slice(-6)

  const interviewTypes = [
    { name: "Technical", value: completedInterviews.length, color: "#3b82f6" },
    { name: "In Progress", value: interviews.length - completedInterviews.length, color: "#f59e0b" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <SidebarItem icon={<Home />} isActive={true}>
            {!sidebarCollapsed && "Dashboard"}
          </SidebarItem>
          <SidebarItem icon={<Play />} onClick={() => handleStartInterview()}>
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
          <div className="mt-auto pb-4">
             <SidebarItem icon={<LogOut />} onClick={logout}>
               {!sidebarCollapsed && "Logout"}
             </SidebarItem>
          </div>
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
                  Welcome back, {user?.name || 'Developer'}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Ready to ace your next interview?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  onClick={() => handleStartInterview()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Interview
                </Button>
              </div>
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
                    {interviews.length}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Track your progress
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
                    {avgScore}/5
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Based on {completedInterviews.length} sessions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Resumes
                  </CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {resumes.length}
                  </div>
                  <Progress value={Math.min(resumes.length * 20, 100)} className="mt-2" />
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
                    7 days
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Keep it up! 🔥
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <XAxis dataKey="name" />
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Session Status
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
                </CardContent>
              </Card>
            </div>

            {/* Recent Interviews Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-slate-200 dark:border-slate-800">
                         <th className="pb-3 font-semibold">Date</th>
                         <th className="pb-3 font-semibold">Status</th>
                         <th className="pb-3 font-semibold">Score</th>
                         <th className="pb-3 font-semibold text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {interviews.slice(0, 5).map((interview) => (
                          <tr key={interview._id || interview.id}>
                            <td className="py-4 text-sm">
                              {interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : (interview.startedAt ? new Date(interview.startedAt).toLocaleDateString() : 'N/A')}
                            </td>
                            <td className="py-4">
                              <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                                {interview.status}
                              </Badge>
                            </td>
                            <td className="py-4 font-bold">
                              {interview.finalScore ? `${interview.finalScore.toFixed(1)}/5` : '-'}
                            </td>
                            <td className="py-4 text-right">
                               {interview.status === 'completed' ? (
                                 <Button variant="ghost" size="sm" onClick={() => navigate(`/interview-result/${interview._id || interview.id}`)}>
                                   View Report
                                 </Button>
                               ) : (
                                 <Button variant="ghost" size="sm" onClick={() => navigate(`/interview/${interview._id || interview.id}`)}>
                                   Resume
                                 </Button>
                               )}
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}