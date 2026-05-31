import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Code, BookOpen, FolderKanban, Flame, Timer, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  isThisWeek,
  calculateStreak,
  calculateAIScore,
} from '../utils/dashboardUtils'
import StatsCard from '../components/dashboard/StatsCard'
import AIScoreRing from '../components/dashboard/AIScoreRing'
import DashboardModal from '../components/dashboard/DashboardModal'
import PomodoroTimer from '../components/dashboard/PomodoroTimer'
import ActivityLog from '../components/dashboard/ActivityLog'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [activeModal, setActiveModal] = useState(null) // 'hours' | 'paper' | 'project' | null
  const [showTimer, setShowTimer] = useState(false)

  // Persistent data via localStorage
  const [hoursLog, setHoursLog] = useLocalStorage('aether_hours_log', [])
  const [papersLog, setPapersLog] = useLocalStorage('aether_papers_log', [])
  const [projectsLog, setProjectsLog] = useLocalStorage('aether_projects_log', [])
  const [activityLog, setActivityLog] = useLocalStorage('aether_activity_log', [])

  // ─── Computed stats ───────────────────────────────────────────────────────
  const weeklyHours = useMemo(
    () => hoursLog.filter(h => isThisWeek(h.date)).reduce((sum, h) => sum + Number(h.hours), 0),
    [hoursLog]
  )

  const weeklyPapers = useMemo(
    () => papersLog.filter(p => isThisWeek(p.date)).length,
    [papersLog]
  )

  const activeProjects = useMemo(
    () => projectsLog.filter(p => p.status === 'in-progress').length,
    [projectsLog]
  )

  const completedProjects = useMemo(
    () => projectsLog.filter(p => p.status === 'completed').length,
    [projectsLog]
  )

  // Streak: collect all activity dates
  const allActivityDates = useMemo(() => {
    return [
      ...hoursLog.map(h => h.date),
      ...papersLog.map(p => p.date),
    ]
  }, [hoursLog, papersLog])

  const streak = useMemo(() => calculateStreak(allActivityDates), [allActivityDates])

  const aiScore = useMemo(
    () => calculateAIScore({ weeklyHours, weeklyPapers, completedProjects, streak }),
    [weeklyHours, weeklyPapers, completedProjects, streak]
  )

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleModalSubmit = (data) => {
    const id = Date.now().toString()

    if (activeModal === 'hours') {
      const entry = { id, ...data, hours: Number(data.hours) }
      setHoursLog(prev => [...prev, entry])
      setActivityLog(prev => [...prev, {
        id,
        type: 'hours',
        label: `Coded ${data.hours} hours`,
        date: data.date,
        notes: data.notes
      }])
      toast.success(`✅ Logged ${data.hours} hours of coding!`)
    }

    if (activeModal === 'paper') {
      const entry = { id, ...data }
      setPapersLog(prev => [...prev, entry])
      setActivityLog(prev => [...prev, {
        id,
        type: 'paper',
        label: `Read: ${data.title}`,
        date: data.date,
        notes: data.notes
      }])
      toast.success(`📄 Paper logged: ${data.title}`)
    }

    if (activeModal === 'project') {
      const entry = { id, ...data, createdAt: new Date().toISOString() }
      setProjectsLog(prev => [...prev, entry])
      setActivityLog(prev => [...prev, {
        id,
        type: 'project',
        label: `Project: ${data.title}`,
        date: new Date().toISOString().split('T')[0],
        notes: data.description
      }])
      toast.success(`🚀 Project created: ${data.title}`)
    }

    setActiveModal(null)
  }

  const handleDeleteLog = (logId) => {
    setActivityLog(prev => prev.filter(l => l.id !== logId))
    toast.success('Entry removed')
  }

  const handleTimerSessionComplete = (hoursAdded) => {
    const id = Date.now().toString()
    const today = new Date().toISOString().split('T')[0]
    setHoursLog(prev => [...prev, { id, hours: hoursAdded, date: today, notes: 'Pomodoro session' }])
    setActivityLog(prev => [...prev, {
      id,
      type: 'session',
      label: `Focus session: ${hoursAdded * 60} min`,
      date: today,
      notes: 'Pomodoro'
    }])
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Engineer'} 👋
        </h1>
        <p className="text-gray-400">Track your AI Engineer journey — every day counts.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Hours Coded"
          value={weeklyHours.toFixed(1)}
          icon={Code}
          gradient="from-primary to-primary-light"
          period="this week"
          clickable
          onClick={() => setActiveModal('hours')}
        />
        <StatsCard
          label="Papers Read"
          value={weeklyPapers}
          icon={BookOpen}
          gradient="from-accent-purple to-accent-pink"
          period="this week"
          clickable
          onClick={() => setActiveModal('paper')}
        />
        <StatsCard
          label="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          gradient="from-accent-cyan to-primary"
          period="in progress"
          clickable
          onClick={() => setActiveModal('project')}
        />
        <StatsCard
          label="Current Streak"
          value={streak}
          icon={Flame}
          gradient="from-orange-500 to-red-500"
          period={streak === 1 ? 'day 🔥' : 'days 🔥'}
        />
      </div>

      {/* AI Score + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 flex flex-col items-center"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="text-lg font-semibold">AI Readiness Score</h3>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <AIScoreRing score={aiScore} />
          <div className="w-full mt-4 space-y-2">
            <ScoreBreakdown label="Hours Coded" value={Math.min((weeklyHours / 40) * 100, 100)} weight="40%" color="bg-primary" />
            <ScoreBreakdown label="Papers Read" value={Math.min((weeklyPapers / 10) * 100, 100)} weight="25%" color="bg-accent-purple" />
            <ScoreBreakdown label="Projects Done" value={Math.min((completedProjects / 10) * 100, 100)} weight="20%" color="bg-accent-cyan" />
            <ScoreBreakdown label="Streak" value={Math.min((streak / 30) * 100, 100)} weight="15%" color="bg-orange-500" />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionBtn
              icon={Timer}
              label="Start Deep Work"
              sub="25 min Pomodoro"
              color="bg-primary/20 text-primary"
              onClick={() => setShowTimer(true)}
            />
            <QuickActionBtn
              icon={Code}
              label="Log Coding Hours"
              sub="Add today's hours"
              color="bg-accent-cyan/20 text-accent-cyan"
              onClick={() => setActiveModal('hours')}
            />
            <QuickActionBtn
              icon={BookOpen}
              label="Log Paper Read"
              sub="Track your research"
              color="bg-accent-purple/20 text-accent-purple"
              onClick={() => setActiveModal('paper')}
            />
            <QuickActionBtn
              icon={FolderKanban}
              label="New Project"
              sub="Start building"
              color="bg-orange-500/20 text-orange-400"
              onClick={() => setActiveModal('project')}
            />
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">This Week</h3>
          <div className="space-y-4">
            <SummaryRow label="Total Hours Coded" value={`${weeklyHours.toFixed(1)}h`} max={40} current={weeklyHours} color="bg-primary" />
            <SummaryRow label="Papers Read" value={weeklyPapers} max={10} current={weeklyPapers} color="bg-accent-purple" />
            <SummaryRow label="Projects Active" value={activeProjects} max={5} current={activeProjects} color="bg-accent-cyan" />
            <SummaryRow label="Projects Completed" value={completedProjects} max={10} current={completedProjects} color="bg-green-500" />
          </div>

          <div className="mt-6 pt-4 border-t border-dark-border">
            <p className="text-xs text-gray-400 mb-1">Streak Goal: 30 days</p>
            <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{streak} / 30 days</p>
          </div>
        </motion.div>
      </div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-3">Activity History</h3>
        <ActivityLog logs={activityLog} onDelete={handleDeleteLog} />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <DashboardModal
            type={activeModal}
            onClose={() => setActiveModal(null)}
            onSubmit={handleModalSubmit}
          />
        )}
      </AnimatePresence>

      {/* Pomodoro Timer */}
      <AnimatePresence>
        {showTimer && (
          <PomodoroTimer
            onClose={() => setShowTimer(false)}
            onSessionComplete={handleTimerSessionComplete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const QuickActionBtn = ({ icon: Icon, label, sub, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-all active:scale-95 text-left"
  >
    <div className={`p-2.5 rounded-lg ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  </button>
)

const SummaryRow = ({ label, value, max, current, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
    <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-700 rounded-full`}
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
      />
    </div>
  </div>
)

const ScoreBreakdown = ({ label, value, weight, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-24 text-xs text-gray-400 flex-shrink-0">{label}</div>
    <div className="flex-1 h-1.5 bg-dark-bg rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-700 rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
    <div className="text-xs text-gray-500 w-8 text-right">{weight}</div>
  </div>
)

export default Dashboard
