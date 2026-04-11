import { motion } from "framer-motion"
import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar, SidebarItem } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Shield,
  Home,
  Play,
  FileText,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Camera,
  Award,
  Save,
  X
} from "lucide-react"
import { authAPI } from "../services/api"

export default function Profile() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || ''
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.updateProfile(formData)
      setUser({ ...user, ...response.data.user })
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update profile.')
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
          <SidebarItem icon={<User />} isActive={true}>
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">User Profile</h1>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <X className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="md:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardContent className="pt-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold mx-auto border-4 border-white dark:border-slate-800 shadow-xl">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                  <p className="text-slate-500 mb-4 capitalize">{user?.role || 'Interviewer'}</p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">LEVEL 12</Badge>
                    <Badge className="bg-emerald-500">VERIFIED</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Details and Stats */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Professional Role</Label>
                          <Input 
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})} 
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-indigo-600">
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <Mail className="h-5 w-5 mr-4 text-indigo-500" />
                          <div>
                            <p className="text-sm text-slate-500">Email Address</p>
                            <p className="font-medium">{user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <Shield className="h-5 w-5 mr-4 text-purple-500" />
                          <div>
                            <p className="text-sm text-slate-500">Account Role</p>
                            <p className="font-medium capitalize">{user?.role}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Platform Achievement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                          <Award className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">Beta Explorer</p>
                          <p className="text-indigo-100 text-sm">Active Member since April 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">Lvl 12</p>
                      </div>
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
