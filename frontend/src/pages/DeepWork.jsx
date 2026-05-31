import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const DeepWork = () => {
  const queryClient = useQueryClient()
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionType, setSessionType] = useState('work') // work, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  
  const [logData, setLogData] = useState({
    codingHours: '',
    researchHours: '',
    papersRead: '',
    notes: ''
  })

  // Timer logic
  useEffect(() => {
    let interval = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      setIsRunning(false)
      toast.success('Session completed! 🎉')
      
      if (sessionType === 'work') {
        setSessionsCompleted(prev => prev + 1)
      }
      
      // Play notification sound (optional)
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGO56+mjUhELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGO56+mjUhELTKXh8bllHAU2jdXzzn0vBQ==')
        audio.play().catch(() => {})
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, sessionType])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    if (sessionType === 'work') {
      setTimeLeft(25 * 60)
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(5 * 60)
    } else {
      setTimeLeft(15 * 60)
    }
  }

  const switchSession = (type) => {
    setIsRunning(false)
    setSessionType(type)
    if (type === 'work') {
      setTimeLeft(25 * 60)
    } else if (type === 'shortBreak') {
      setTimeLeft(5 * 60)
    } else {
      setTimeLeft(15 * 60)
    }
  }

  const createLogMutation = useMutation({
    mutationFn: (data) => api.post('/work-sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['work-sessions'])
      toast.success('Work session logged!')
      setLogData({
        codingHours: '',
        researchHours: '',
        papersRead: '',
        notes: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to log session')
    }
  })

  const handleLogSubmit = (e) => {
    e.preventDefault()
    createLogMutation.mutate({
      date: new Date(),
      type: 'daily-log',
      codingHours: parseFloat(logData.codingHours) || 0,
      researchHours: parseFloat(logData.researchHours) || 0,
      papersRead: parseInt(logData.papersRead) || 0,
      focusSessions: sessionsCompleted,
      notes: logData.notes
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deep Work Tracker</h1>
        <p className="text-gray-400">Focus sessions and productivity logging</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">Pomodoro Timer</h2>
          
          {/* Session Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => switchSession('work')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                sessionType === 'work' ? 'bg-primary text-white' : 'bg-dark-bg hover:bg-dark-hover'
              }`}
            >
              Work (25m)
            </button>
            <button
              onClick={() => switchSession('shortBreak')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                sessionType === 'shortBreak' ? 'bg-primary text-white' : 'bg-dark-bg hover:bg-dark-hover'
              }`}
            >
              Break (5m)
            </button>
            <button
              onClick={() => switchSession('longBreak')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                sessionType === 'longBreak' ? 'bg-primary text-white' : 'bg-dark-bg hover:bg-dark-hover'
              }`}
            >
              Long (15m)
            </button>
          </div>
          
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-dark-border"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#timer-gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - timeLeft / (sessionType === 'work' ? 25 * 60 : sessionType === 'shortBreak' ? 5 * 60 : 15 * 60))}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</p>
                <p className="text-sm text-gray-400 capitalize">{sessionType.replace(/([A-Z])/g, ' $1')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleStartPause}
              className="p-4 bg-primary hover:bg-primary-dark rounded-full transition-colors"
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={handleReset}
              className="p-4 bg-dark-bg hover:bg-dark-hover rounded-full transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">Sessions Completed Today</p>
            <p className="text-3xl font-bold text-primary">{sessionsCompleted}</p>
          </div>
        </motion.div>

        {/* Daily Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Today's Log</h2>
          </div>

          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Coding Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={logData.codingHours}
                onChange={(e) => setLogData({ ...logData, codingHours: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Research Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={logData.researchHours}
                onChange={(e) => setLogData({ ...logData, researchHours: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Papers Read</label>
              <input
                type="number"
                min="0"
                value={logData.papersRead}
                onChange={(e) => setLogData({ ...logData, papersRead: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                rows="3"
                value={logData.notes}
                onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                placeholder="What did you work on today?"
              />
            </div>
            
            <div className="p-3 bg-dark-bg rounded-lg">
              <p className="text-sm text-gray-400">Focus Sessions Completed</p>
              <p className="text-2xl font-bold text-primary">{sessionsCompleted}</p>
            </div>

            <button 
              type="submit"
              disabled={createLogMutation.isPending}
              className="w-full bg-primary hover:bg-primary-dark py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {createLogMutation.isPending ? 'Saving...' : 'Save Log'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default DeepWork
