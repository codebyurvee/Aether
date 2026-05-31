import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const { user, logout } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="h-16 bg-dark-card border-b border-dark-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-dark-hover rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="text-sm font-medium hidden md:block">{user?.name}</span>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 glass rounded-lg overflow-hidden z-50"
              >
                <div className="p-3 border-b border-dark-border">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setShowProfile(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark-hover transition-colors text-red-400"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default Header
