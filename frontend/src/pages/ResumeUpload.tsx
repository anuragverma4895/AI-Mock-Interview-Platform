import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ShieldCheck,
  BarChart3,
  Zap,
  Target
} from "lucide-react"
import { resumeAPI } from "../services/api"

interface ParsedResume {
  skills: string[]
  projects: Array<{ name: string; description: string }>
  experience: Array<{ company: string; role: string; duration: string }>
}

type JobRole = 'frontend' | 'backend' | 'fullstack' | 'mern' | 'mevn' | 'dse' | 'da' | 'ds' | 'mobile' | 'devops' | 'qa'

interface RoleAnalysis {
  matchPercentage: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  relevantSkills: string[]
}

const JOB_ROLES: { id: JobRole; label: string; icon: string; color: string }[] = [
  { id: 'frontend', label: 'Frontend Developer', icon: '🎨', color: 'from-blue-500 to-cyan-500' },
  { id: 'backend', label: 'Backend Developer', icon: '⚙️', color: 'from-purple-500 to-pink-500' },
  { id: 'fullstack', label: 'Full Stack Developer', icon: '🔗', color: 'from-indigo-500 to-purple-500' },
  { id: 'mern', label: 'MERN Stack', icon: '⚛️', color: 'from-green-500 to-emerald-500' },
  { id: 'mevn', label: 'MEVN Stack', icon: '💚', color: 'from-lime-500 to-green-500' },
  { id: 'mobile', label: 'Mobile Developer', icon: '📱', color: 'from-orange-500 to-red-500' },
  { id: 'dse', label: 'Data Science Engineer', icon: '📊', color: 'from-yellow-500 to-orange-500' },
  { id: 'da', label: 'Data Analyst', icon: '📈', color: 'from-rose-500 to-pink-500' },
  { id: 'ds', label: 'DevOps/SRE', icon: '🐳', color: 'from-red-500 to-orange-500' },
  { id: 'devops', label: 'Cloud Engineer', icon: '☁️', color: 'from-sky-500 to-blue-500' },
  { id: 'qa', label: 'QA Engineer', icon: '🧪', color: 'from-violet-500 to-purple-500' },
]

const ROLE_SPECIFIC_SKILLS: Record<JobRole, string[]> = {
  frontend: ['react', 'vue', 'angular', 'typescript', 'javascript', 'css', 'html', 'tailwind', 'nextjs'],
  backend: ['node', 'express', 'python', 'django', 'java', 'spring', 'sql', 'api', 'rest'],
  fullstack: ['react', 'node', 'express', 'mongodb', 'sql', 'javascript', 'typescript', 'html', 'css'],
  mern: ['mongodb', 'express', 'react', 'node', 'javascript', 'api', 'rest', 'json'],
  mevn: ['mongodb', 'express', 'vue', 'node', 'javascript', 'api', 'rest'],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'javascript', 'typescript'],
  dse: ['python', 'machine learning', 'ai', 'data science', 'sql', 'pandas', 'tensorflow'],
  da: ['sql', 'analytics', 'bi tools', 'excel', 'tableau', 'power bi', 'data visualization'],
  ds: ['docker', 'kubernetes', 'linux', 'ci/cd', 'jenkins', 'git', 'cloud'],
  devops: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'terraform'],
  qa: ['testing', 'automation', 'selenium', 'jest', 'quality', 'bug tracking'],
}

export default function ResumeUpload() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null)
  const [roleAnalysis, setRoleAnalysis] = useState<RoleAnalysis | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
      setParsedResume(null)
      setSelectedRole(null)
      setRoleAnalysis(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setStatus('idle')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await resumeAPI.upload(formData)
      setParsedResume(res.data.resume.parsedData)
      setResumeId(res.data.resume._id)
      setStatus('success')
      setMessage('Resume uploaded successfully! Now select a role to analyze your fit.')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Error uploading resume. Please try a valid PDF or DOCX.')
    } finally {
      setLoading(false)
    }
  }

  const analyzeForRole = (role: JobRole) => {
    if (!parsedResume) return

    setSelectedRole(role)

    const roleSkills = ROLE_SPECIFIC_SKILLS[role]
    const userSkillsLower = parsedResume.skills.map(s => s.toLowerCase())
    
    const relevantSkills = userSkillsLower.filter(skill =>
      roleSkills.some(rs => skill.includes(rs) || rs.includes(skill))
    )

    const matchPercentage = Math.round((relevantSkills.length / roleSkills.length) * 100)

    // Generate strengths based on matching skills
    const strengths: string[] = []
    if (relevantSkills.length > 0) {
      strengths.push(`Strong foundation in ${relevantSkills.slice(0, 3).join(', ')}`)
    }
    if (parsedResume.projects.length > 0) {
      strengths.push(`${parsedResume.projects.length} relevant projects completed`)
    }
    if (parsedResume.experience.length > 0) {
      strengths.push(`${parsedResume.experience.length} years of professional experience`)
    }

    // Generate gaps
    const gaps: string[] = []
    const missingSkills = roleSkills.filter(rs =>
      !userSkillsLower.some(s => s.includes(rs) || rs.includes(s))
    )
    if (missingSkills.length > 0) {
      gaps.push(`Missing key technologies: ${missingSkills.slice(0, 3).join(', ')}`)
    }
    if (parsedResume.projects.length === 0) {
      gaps.push('No project experience documented')
    }

    // Generate recommendations
    const recommendations: string[] = [
      `Focus on mastering ${missingSkills.slice(0, 2).join(' and ')}`,
      'Build real-world projects showcasing these technologies',
      'Prepare for role-specific interview questions',
      'Work on system design and architecture skills',
    ]

    setRoleAnalysis({
      matchPercentage,
      strengths,
      gaps: gaps.length > 0 ? gaps : ['You have most of the key skills!'],
      recommendations,
      relevantSkills,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar>
          <SidebarItem icon={<Home />} onClick={() => navigate('/dashboard')}>
            Dashboard
          </SidebarItem>
          <SidebarItem icon={<Play />} onClick={() => navigate('/interview-setup')}>
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
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Resume Analysis</h1>
                <p className="text-white/70">AI-powered role-based resume analysis and career insights</p>
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Enterprise Security
              </div>
            </div>

            {!parsedResume ? (
              // Upload Section
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Upload Your Resume</CardTitle>
                  <CardDescription className="text-white/60">
                    We support PDF and DOCX formats up to 5MB
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      file
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
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
                      <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-cyan-400" />
                      </div>
                      {file ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-white">{file.name}</p>
                          <p className="text-sm text-white/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-lg text-white">Click to browse or drag and drop</p>
                          <p className="text-white/60">PDF and DOCX files supported</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/80">
                        <span>Analyzing resume...</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}

                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start p-4 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Success!</p>
                        <p className="text-sm text-emerald-200/80">{message}</p>
                      </div>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start p-4 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30"
                    >
                      <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Error</p>
                        <p className="text-sm text-red-200/80">{message}</p>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 text-lg shadow-lg shadow-cyan-500/25"
                  >
                    {loading ? 'Processing...' : 'Upload & Analyze'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Analysis Section
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Parsed Data Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Skills Found</span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="text-3xl font-bold text-white">{parsedResume.skills.length}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {parsedResume.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {parsedResume.skills.length > 3 && (
                          <Badge className="bg-white/10 text-white/60 border-white/20 text-xs">
                            +{parsedResume.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Projects</span>
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold text-white">{parsedResume.projects.length}</p>
                      <p className="text-white/60 text-xs mt-2">Real-world experience</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Experience</span>
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-3xl font-bold text-white">{parsedResume.experience.length}</p>
                      <p className="text-white/60 text-xs mt-2">Job positions</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Role Selection */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Select a Role to Analyze Your Fit</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {JOB_ROLES.map((role) => (
                      <motion.button
                        key={role.id}
                        onClick={() => analyzeForRole(role.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedRole === role.id
                            ? 'bg-gradient-to-r ' + role.color + ' border-white/40 shadow-lg shadow-cyan-500/25'
                            : 'bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-2xl mb-2">{role.icon}</p>
                            <h3 className={selectedRole === role.id ? 'font-bold text-lg' : 'text-white font-semibold'}>
                              {role.label}
                            </h3>
                          </div>
                          {selectedRole === role.id && (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                {roleAnalysis && selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Match Percentage */}
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Role Match Score</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Match Percentage</span>
                            <span className="text-2xl font-bold text-cyan-400">{roleAnalysis.matchPercentage}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${roleAnalysis.matchPercentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                            />
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">
                          {roleAnalysis.matchPercentage >= 75
                            ? '✅ Excellent match for this role!'
                            : roleAnalysis.matchPercentage >= 50
                            ? '⚠️ Good foundation, some gaps to fill'
                            : '📚 Would need more skill development'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Strengths */}
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          Your Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {roleAnalysis.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80">
                              <span className="text-emerald-400 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Gaps */}
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                          Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {roleAnalysis.gaps.map((gap, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80">
                              <span className="text-yellow-400 mt-1">!</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {roleAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/80">
                              <span className="text-blue-400 font-bold min-w-6">{idx + 1}.</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          navigate('/interview-setup', { state: { resumeId, jobRole: selectedRole } })
                        }}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 text-lg shadow-lg shadow-cyan-500/25"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Start Interview for {JOB_ROLES.find(r => r.id === selectedRole)?.label}
                      </Button>
                      <Button
                        onClick={() => {
                          setFile(null)
                          setParsedResume(null)
                          setSelectedRole(null)
                          setRoleAnalysis(null)
                          setStatus('idle')
                        }}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 text-lg"
                      >
                        Upload Different Resume
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}