import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import {
  User,
  Home,
  Play,
  FileText,
  TrendingUp,
  Settings as SettingsIcon,
  Bell,
  Moon,
  Lock,
  Globe,
  Trash2,
  ShieldAlert
} from "lucide-react"
import { authAPI, driveAPI } from "../services/api"

export default function Settings() {
  const { user, setUser } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const isDarkMode = theme === 'dark'
  const [driveConnected, setDriveConnected] = useState(user?.googleDriveConnected || false)
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveMessage, setDriveMessage] = useState('')

  // Handle Drive OAuth callback URL params
  useEffect(() => {
    if (searchParams.get('drive_connected') === 'true') {
      setDriveConnected(true)
      setDriveMessage('Google Drive connected successfully!')
      // Update user state
      if (user) setUser({ ...user, googleDriveConnected: true })
      // Clean URL
      searchParams.delete('drive_connected')
      setSearchParams(searchParams, { replace: true })
      setTimeout(() => setDriveMessage(''), 5000)
    }
    const driveError = searchParams.get('drive_error')
    if (driveError) {
      setDriveMessage(`Drive connection failed: ${driveError}`)
      searchParams.delete('drive_error')
      setSearchParams(searchParams, { replace: true })
      setTimeout(() => setDriveMessage(''), 5000)
    }
  }, [searchParams])

  // Check Drive status on mount
  useEffect(() => {
    driveAPI.getStatus().then(res => {
      setDriveConnected(res.data.connected)
    }).catch(() => {})
  }, [])

  const handleUpdateRole = async (newRole: string) => {
    if (!user) return
    setLoading(true)
    try {
      await authAPI.updateSettings({ role: newRole })
      setUser({ ...user, role: newRole })
      alert('Default role updated successfully!')
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update settings.')
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
          <SidebarItem icon={<FileText />} onClick={() => navigate('/resume')}>
            Resume Analysis
          </SidebarItem>
          <SidebarItem icon={<TrendingUp />} onClick={() => navigate('/analytics')}>
            Analytics
          </SidebarItem>
          <SidebarItem icon={<User />} onClick={() => navigate('/profile')}>
            Profile
          </SidebarItem>
          <SidebarItem icon={<SettingsIcon />} isActive={true}>
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
            <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Platform Settings</h1>

            <div className="space-y-6">
              {/* Account Preferences */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-indigo-500" />
                    Interview Role
                  </CardTitle>
                  <CardDescription>Select your primary goal on the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant={user?.role === 'candidate' ? 'default' : 'outline'}
                        onClick={() => handleUpdateRole('candidate')}
                        disabled={loading}
                        className="h-16"
                      >
                        Candidate (Looking for Jobs)
                      </Button>
                      <Button 
                        variant={user?.role === 'admin' ? 'default' : 'outline'}
                        onClick={() => handleUpdateRole('interviewer')}
                        disabled={loading}
                        className="h-16"
                      >
                        Interviewer (Practicing Reviews)
                      </Button>
                   </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-blue-500" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Manage how the platform looks for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      aria-label="Toggle dark mode"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-500" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure your email and platform alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Interview Reminders</Label>
                      <p className="text-sm text-slate-500">Receive alerts about upcoming mock interviews.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Performance Reports</Label>
                      <p className="text-sm text-slate-500">Weekly summary of your session analytics.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Google Drive Integration */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H1.05c0 1.6.4 3.2 1.2 4.6l4.35 9.25z" fill="#0066DA"/><path d="M43.65 25.05L29.9 1.25c-1.35.8-2.5 1.9-3.3 3.3L1.2 52.9c-.8 1.4-1.2 2.95-1.2 4.6h27.45l16.2-32.45z" fill="#00AC47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.6H59.85L73.55 76.8z" fill="#EA4335"/><path d="M43.65 25.05L57.4 1.25C56.05.45 54.5 0 52.85 0H34.4c-1.6 0-3.2.5-4.5 1.25l13.75 23.8z" fill="#00832D"/><path d="M59.85 52.9H27.45l-13.75 23.8c1.35.8 2.9 1.3 4.5 1.3h50.5c1.6 0 3.2-.5 4.55-1.3L59.85 52.9z" fill="#2684FC"/><path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25.05l16.2 27.85H87.3c0-1.6-.4-3.2-1.2-4.6L73.4 26.5z" fill="#FFBA00"/></svg>
                    Google Drive
                  </CardTitle>
                  <CardDescription>Save your interview recordings directly to your Google Drive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {driveMessage && (
                    <div className={`p-3 rounded-xl text-sm font-medium ${
                      driveMessage.includes('success') 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {driveMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Connection Status</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {driveConnected
                          ? 'Your Google Drive is connected. Recordings will be saved to PrepVerse/Interview Recordings.'
                          : 'Connect your Google Drive to save interview recordings.'}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      driveConnected
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {driveConnected ? '● Connected' : '○ Not Connected'}
                    </div>
                  </div>

                  {driveConnected ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl py-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled={driveLoading}
                      onClick={async () => {
                        setDriveLoading(true)
                        try {
                          await driveAPI.disconnect()
                          setDriveConnected(false)
                          if (user) setUser({ ...user, googleDriveConnected: false })
                          setDriveMessage('Google Drive disconnected.')
                          setTimeout(() => setDriveMessage(''), 3000)
                        } catch {
                          setDriveMessage('Failed to disconnect Drive.')
                        } finally {
                          setDriveLoading(false)
                        }
                      }}
                    >
                      <Trash2 className="mr-4 h-5 w-5" />
                      Disconnect Google Drive
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-start rounded-xl py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={driveLoading}
                      onClick={async () => {
                        setDriveLoading(true)
                        try {
                          const res = await driveAPI.getConnectUrl()
                          window.location.href = res.data.authUrl
                        } catch {
                          setDriveMessage('Failed to initiate Drive connection.')
                          setDriveLoading(false)
                        }
                      }}
                    >
                      <Globe className="mr-4 h-5 w-5" />
                      Connect Google Drive
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-500" />
                    Security
                  </CardTitle>
                  <CardDescription>Secure your account with advanced options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start rounded-xl py-6">
                    <Lock className="mr-4 h-5 w-5" />
                    Change Account Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl py-6">
                    <Globe className="mr-4 h-5 w-5" />
                    Manage Active Login Sessions
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 bg-red-50/20 dark:bg-red-950/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Permanent actions that cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="rounded-xl">
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
