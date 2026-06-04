import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Target, 
  Brain, 
  FolderKanban, 
  Timer, 
  Briefcase, 
  Lightbulb, 
  Sparkles,
  TrendingUp,
  Settings,
  Menu,
  X,
  Bot
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { calculateAIScore, isThisWeek, calculateStreak } from '../utils/dashboardUtils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/phases', icon: Target, label: 'Life Phases' },
  { to: '/skills', icon: Brain, label: 'Skills' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/deep-work', icon: Timer, label: 'Deep Work' },
  { to: '/career', icon: Briefcase, label: 'Career' },
  { to: '/research', icon: Lightbulb, label: 'Research' },
  { to: '/brand', icon: Sparkles, label: 'Brand' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/ai', icon: Bot, label: 'Aria AI ✨' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = () => {
  const { user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Real AI score from localStorage (same source as Dashboard)
  const [hoursLog] = useLocalStorage('aether_hours_log', [])
  const [papersLog] = useLocalStorage('aether_papers_log', [])
  const [projectsLog] = useLocalStorage('aether_projects_log', [])

  const weeklyHours = hoursLog.filter(h => isThisWeek(h.date)).reduce((sum, h) => sum + Number(h.hours), 0)
  const weeklyPapers = papersLog.filter(p => isThisWeek(p.date)).length
  const completedProjects = projectsLog.filter(p => p.status === 'completed').length
  const allDates = [...hoursLog.map(h => h.date), ...papersLog.map(p => p.date)]
  const streak = calculateStreak(allDates)
  const aiScore = calculateAIScore({ weeklyHours, weeklyPapers, completedProjects, streak })

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold gradient-text">Aether</h1>
        <p className="text-xs text-gray-400 mt-1">AI Engineer OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-dark-hover hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - Real AI Score */}
      <div className="p-4 border-t border-dark-border">
        <div className="glass rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-400">AI Readiness</p>
            <p className="text-sm font-bold text-primary">{aiScore}%</p>
          </div>
          <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent-purple rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${aiScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {user?.name?.split(' ')[0]} · Phase {user?.currentPhase || 1}
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-card border-r border-dark-border flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-dark-card border border-dark-border rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-dark-card border-r border-dark-border z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-dark-hover rounded-lg"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
