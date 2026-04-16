import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { analyticsAPI } from '../services/api';
import { Analytics as AnalyticsData } from '../types';
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import {
  Home,
  Play,
  FileText,
  TrendingUp,
  User,
  Settings as SettingsIcon,
  Award,
  BarChart3,
  Brain,
  Target
} from "lucide-react"

export default function Analytics() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getUserAnalytics(user?.id || '');
      setAnalytics(res.data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setError(error?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || (analytics.totalInterviews === 0 && (!analytics.scoreTrends || analytics.scoreTrends.length === 0))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex">
          <Sidebar>
            <SidebarItem icon={<Home />} onClick={() => navigate('/dashboard')}>
              Dashboard
            </SidebarItem>
            <SidebarItem icon={<Play />} onClick={() => navigate('/interview')}>
              Start Interview
            </SidebarItem>
            <SidebarItem icon={<FileText />} onClick={() => navigate('/resume')}>
              Resume Analysis
            </SidebarItem>
            <SidebarItem icon={<TrendingUp />} isActive={true}>
              Analytics
            </SidebarItem>
            <SidebarItem icon={<User />} onClick={() => navigate('/profile')}>
              Profile
            </SidebarItem>
            <SidebarItem icon={<SettingsIcon />} onClick={() => navigate('/settings')}>
              Settings
            </SidebarItem>
          </Sidebar>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-3">No Analytics Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                Complete your first interview to see detailed analytics and insights about your performance.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar>
          <SidebarItem icon={<Home />} onClick={() => navigate('/dashboard')}>
            Dashboard
          </SidebarItem>
          <SidebarItem icon={<Play />} onClick={() => navigate('/interview')}>
            Start Interview
          </SidebarItem>
          <SidebarItem icon={<FileText />} onClick={() => navigate('/resume')}>
            Resume Analysis
          </SidebarItem>
          <SidebarItem icon={<TrendingUp />} isActive={true}>
            Analytics
          </SidebarItem>
          <SidebarItem icon={<User />} onClick={() => navigate('/profile')}>
            Profile
          </SidebarItem>
          <SidebarItem icon={<SettingsIcon />} onClick={() => navigate('/settings')}>
            Settings
          </SidebarItem>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Performance Analytics</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Deep insights into your interview readiness and skill distribution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <BarChart3 className="h-8 w-8 text-indigo-100" />
                    <Award className="h-6 w-6 text-indigo-100/50" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{analytics?.totalInterviews || 0}</div>
                  <div className="text-indigo-100 font-medium">Interviews Completed</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Brain className="h-8 w-8 text-emerald-100" />
                    <Award className="h-6 w-6 text-emerald-100/50" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{analytics?.averageScore?.toFixed(1) || '0.0'}</div>
                  <div className="text-emerald-100 font-medium">Average Platform Score</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Target className="h-8 w-8 text-purple-100" />
                    <Award className="h-6 w-6 text-purple-100/50" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{(analytics?.totalInterviews || 0) * 10}</div>
                  <div className="text-purple-100 font-medium">Questions Attempted</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Matrix: Strong Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {analytics?.strongAreas && analytics.strongAreas.length > 0 ? (
                      analytics.strongAreas.map((area, i) => (
                        <span key={i} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800">
                          {area}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500">More data needed to compute strengths.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Focus Required: Weak Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {analytics?.weakAreas && analytics.weakAreas.length > 0 ? (
                      analytics.weakAreas.map((area, i) => (
                        <span key={i} className="px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl font-bold border border-red-200 dark:border-red-800">
                          {area}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500">Identifying areas for improvement...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Interview Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.recentInterviews && analytics.recentInterviews.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b dark:border-slate-800 text-slate-500 text-sm">
                          <th className="pb-4 font-semibold">Date</th>
                          <th className="pb-4 font-semibold">Score</th>
                          <th className="pb-4 font-semibold">Metrics</th>
                          <th className="pb-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentInterviews.map((interview, i) => (
                          <tr key={i} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-4 font-medium">
                              {new Date(interview.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                interview.finalScore >= 4 ? 'bg-emerald-100 text-emerald-700' :
                                interview.finalScore >= 3 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {interview.finalScore.toFixed(1)} / 5.0
                              </span>
                            </td>
                            <td className="py-4 text-slate-500 text-sm">
                              {interview.questionCount} Questions Answered
                            </td>
                            <td className="py-4 text-right">
                               <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 font-bold">
                                 View Report
                               </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <TrendingUp className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-500">Your interview journey starts here. Complete a session to see history!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}