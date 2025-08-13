import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Eye,
  Ban,
  Crown
} from 'lucide-react'
import { useAuth } from '@/react-app/hooks/useAuth'
import { Navigate } from 'react-router'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalConversations: number
  flaggedContent: number
  averageMood: number
}

interface User {
  id: string
  email: string
  role: string
  created_at: string
  last_active?: string
  conversation_count: number
}

interface FlaggedContent {
  id: string
  conversation_id: string
  user_email: string
  content: string
  flagged_at: string
  severity: 'low' | 'medium' | 'high'
}

export default function Admin() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalConversations: 0,
    flaggedContent: 0,
    averageMood: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Load flagged content
      const flaggedResponse = await fetch('/api/admin/flagged-content')
      if (flaggedResponse.ok) {
        const flaggedData = await flaggedResponse.json()
        setFlaggedContent(flaggedData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
    setLoading(false)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const resolveFlaggedContent = async (flagId: string) => {
    try {
      const response = await fetch(`/api/admin/flagged-content/${flagId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFlaggedContent(flaggedContent.filter(item => item.id !== flagId))
        setStats(prev => ({ ...prev, flaggedContent: prev.flaggedContent - 1 }))
      }
    } catch (error) {
      console.error('Error resolving flagged content:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'moderation', name: 'Moderation', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-slate-400">Monitor and manage the Spillmate platform</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-300">System Online</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Conversations</p>
                    <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Avg Mood</p>
                    <p className="text-2xl font-bold text-white">{stats.averageMood.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Flagged Content</p>
                    <p className="text-2xl font-bold text-white">{stats.flaggedContent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">API Response Time</span>
                    <span className="text-green-400 font-medium">142ms</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Database Load</span>
                    <span className="text-yellow-400 font-medium">67%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">AI Model Health</span>
                    <span className="text-green-400 font-medium">99.2%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '99%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">User Management</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-300 font-medium">User</th>
                      <th className="text-left py-3 text-slate-300 font-medium">Role</th>
                      <th className="text-left py-3 text-slate-300 font-medium">Conversations</th>
                      <th className="text-left py-3 text-slate-300 font-medium">Joined</th>
                      <th className="text-left py-3 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-800">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                          >
                            <option value="free_user">Free User</option>
                            <option value="premium_user">Premium User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 text-slate-300">{user.conversation_count}</td>
                        <td className="py-4 text-slate-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'moderation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Content Moderation</h3>
              
              {flaggedContent.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">No Flagged Content</h3>
                    <p className="text-slate-400 text-sm">
                      All content is currently within guidelines.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.severity === 'high' ? 'bg-red-500' :
                            item.severity === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
                          }`} />
                          <span className="text-white font-medium">{item.user_email}</span>
                          <span className="text-slate-400 text-sm">
                            {new Date(item.flagged_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => resolveFlaggedContent(item.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Resolve
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                            Take Action
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-3">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
