import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Home,
  Play,
  TrendingUp,
  User,
  Settings as SettingsIcon,
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { resumeAPI } from "../services/api"

export default function ResumeUpload() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setStatus('idle')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      await resumeAPI.upload(formData)
      setStatus('success')
      setMessage('Resume uploaded and analyzed successfully! You can now start interviews targeted to your experience.')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Error uploading resume. Please try a valid PDF or DOCX.')
    } finally {
      setLoading(false)
    }
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
          <SidebarItem icon={<FileText />} isActive={true}>
            Resume Analysis
          </SidebarItem>
          <SidebarItem icon={<TrendingUp />} onClick={() => navigate('/analytics')}>
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
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Resume Analysis</h1>
                <p className="text-slate-600 dark:text-slate-300">AI-powered insights for your professional profile.</p>
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Enterprise Security Enabled
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Upload New Resume</CardTitle>
                  <CardDescription>We support PDF and DOCX formats up to 5MB.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div 
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      file ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-indigo-600" />
                      </div>
                      {file ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-indigo-700">{file.name}</p>
                          <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-lg">Click to browse or drag and drop</p>
                          <p className="text-slate-500">Only PDF and DOCX files are allowed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyzing resume...</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}

                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800">
                      <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5" />
                      <div>
                        <p className="font-bold">Success!</p>
                        <p className="text-sm">{message}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => navigate('/dashboard')}
                        >
                          Start Targeted Interview
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800">
                      <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                      <div>
                        <p className="font-bold">Error Occurred</p>
                        <p className="text-sm">{message}</p>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 h-12 text-lg shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? 'Processing...' : 'Upload for Analysis'}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">1</div>
                      <p>Ensure your resume includes industry-standard keywords related to your target role.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">2</div>
                      <p>Quantifiable achievements (e.g., "Increased sales by 20%") are better analyzed by our AI.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">3</div>
                      <p>Clear formatting helps our parser understand your career progression accurately.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}