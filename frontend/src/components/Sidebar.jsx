import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  Brain, 
  FolderKanban, 
  Timer, 
  Briefcase, 
  Lightbulb, 
  TrendingUp,
  Sparkles
} from 'lucide-react'

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
]

const Sidebar = () => {
  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-dark-hover hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-border">
        <div className="glass rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">AI Readiness</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent-purple w-2/3" />
            </div>
            <span className="text-sm font-semibold">67%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
