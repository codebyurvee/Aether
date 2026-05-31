import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import toast from 'react-hot-toast'

const MODES = {
  pomodoro: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long: { label: 'Long Break', minutes: 15 },
}

const PomodoroTimer = ({ onClose, onSessionComplete }) => {
  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef(null)

  const totalSeconds = MODES[mode].minutes * 60
  const progress = (timeLeft / totalSeconds) * 100
  const radius = 110
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode])

  const handleComplete = () => {
    toast.success(`${MODES[mode].label} session complete! 🎉`)
    if (mode === 'pomodoro') {
      const newCount = sessionsToday + 1
      setSessionsToday(newCount)
      onSessionComplete && onSessionComplete(MODES[mode].minutes / 60)
    }
  }

  const switchMode = (newMode) => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODES[newMode].minutes * 60)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setTimeLeft(MODES[mode].minutes * 60)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Deep Work Timer</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 bg-dark-bg rounded-xl p-1">
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === key
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Timer Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-64">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle cx="128" cy="128" r={radius} stroke="#1f1f28" strokeWidth="10" fill="transparent" />
              <motion.circle
                cx="128"
                cy="128"
                r={radius}
                stroke="url(#timer-grad)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
              <span className="text-sm text-gray-400 mt-1">{MODES[mode].label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={reset}
            className="p-4 bg-dark-bg hover:bg-dark-hover rounded-full transition-colors"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-10 py-4 bg-primary hover:bg-primary-dark rounded-full font-semibold text-lg transition-colors flex items-center gap-2"
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
        </div>

        {/* Sessions */}
        <div className="text-center">
          <p className="text-sm text-gray-400">Sessions completed today</p>
          <div className="flex justify-center gap-2 mt-2">
            {[...Array(Math.max(4, sessionsToday))].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < sessionsToday ? 'bg-primary' : 'bg-dark-border'}`}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-primary mt-1">{sessionsToday}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default PomodoroTimer
