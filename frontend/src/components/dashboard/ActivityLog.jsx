import { motion } from 'framer-motion'
import { Code, BookOpen, FolderKanban, Clock, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/dashboardUtils'

const iconMap = {
  hours: { icon: Code, color: 'text-primary', bg: 'bg-primary/20' },
  paper: { icon: BookOpen, color: 'text-accent-purple', bg: 'bg-accent-purple/20' },
  project: { icon: FolderKanban, color: 'text-accent-cyan', bg: 'bg-accent-cyan/20' },
  session: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/20' },
}

const ActivityLog = ({ logs, onDelete }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">No activity logged yet. Start by adding hours or reading a paper!</p>
      </div>
    )
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-dark-border">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-xs text-gray-400 mt-0.5">Last {sorted.length} entries</p>
      </div>
      <div className="divide-y divide-dark-border max-h-80 overflow-y-auto">
        {sorted.map((log, i) => {
          const cfg = iconMap[log.type] || iconMap.hours
          const Icon = cfg.icon
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-4 hover:bg-dark-hover/50 transition-colors group"
            >
              <div className={`p-2 rounded-lg ${cfg.bg} flex-shrink-0`}>
                <Icon size={16} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.label}</p>
                <p className="text-xs text-gray-400">{formatDate(log.date)}</p>
                {log.notes && <p className="text-xs text-gray-500 truncate mt-0.5">{log.notes}</p>}
              </div>
              <button
                onClick={() => onDelete(log.id)}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default ActivityLog
