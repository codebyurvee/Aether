import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Bell, Timer, Target, Save } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    currentPhase: user?.currentPhase || 1
  })

  const [preferences, setPreferences] = useState({
    pomodoroLength: user?.preferences?.pomodoroLength || 25,
    shortBreak: user?.preferences?.shortBreak || 5,
    longBreak: user?.preferences?.longBreak || 15,
    dailyGoalHours: user?.preferences?.dailyGoalHours || 4
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/user/profile', data),
    onSuccess: (response) => {
      updateUser(response.data.data)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Failed to update profile')
  })

  const updatePrefMutation = useMutation({
    mutationFn: (data) => api.put('/user/preferences', data),
    onSuccess: (response) => {
      updateUser({ preferences: response.data.data.preferences })
      toast.success('Preferences saved!')
    },
    onError: () => toast.error('Failed to update preferences')
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileData)
  }

  const handlePrefSubmit = (e) => {
    e.preventDefault()
    updatePrefMutation.mutate(preferences)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Customize your Aether experience</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-lg">
            <User size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Learning Phase</label>
            <select
              value={profileData.currentPhase}
              onChange={(e) => setProfileData({ ...profileData, currentPhase: parseInt(e.target.value) })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            >
              <option value={1}>Phase 1 — Foundation</option>
              <option value={2}>Phase 2 — Core AI Mastery</option>
              <option value={3}>Phase 3 — Advanced & Research</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </motion.div>

      {/* Pomodoro Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-purple/20 rounded-lg">
            <Timer size={20} className="text-accent-purple" />
          </div>
          <h2 className="text-xl font-semibold">Pomodoro Settings</h2>
        </div>

        <form onSubmit={handlePrefSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Focus (min)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={preferences.pomodoroLength}
                onChange={(e) => setPreferences({ ...preferences, pomodoroLength: parseInt(e.target.value) })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Short Break (min)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={preferences.shortBreak}
                onChange={(e) => setPreferences({ ...preferences, shortBreak: parseInt(e.target.value) })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Long Break (min)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={preferences.longBreak}
                onChange={(e) => setPreferences({ ...preferences, longBreak: parseInt(e.target.value) })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Daily Goal (hours)</label>
            <input
              type="number"
              min="1"
              max="16"
              step="0.5"
              value={preferences.dailyGoalHours}
              onChange={(e) => setPreferences({ ...preferences, dailyGoalHours: parseFloat(e.target.value) })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={updatePrefMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {updatePrefMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent-cyan/20 rounded-lg">
            <Target size={20} className="text-accent-cyan" />
          </div>
          <h2 className="text-xl font-semibold">Account Info</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Auth Provider</span>
            <span className="capitalize">{user?.authProvider || 'email'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-border">
            <span className="text-gray-400">Current Phase</span>
            <span>Phase {user?.currentPhase || 1}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Best Streak</span>
            <span>{user?.streak?.longest || 0} days</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings
