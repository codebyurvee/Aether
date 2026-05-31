import { motion } from 'framer-motion'

const StatsCard = ({ label, value, icon: Icon, gradient, period, onClick, clickable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={clickable ? { scale: 1.02, y: -2 } : {}}
      onClick={clickable ? onClick : undefined}
      className={`glass rounded-xl p-6 ${clickable ? 'cursor-pointer hover:border-primary/40 border border-transparent transition-all' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon size={24} className="text-white" />
        </div>
        {clickable && (
          <span className="text-xs text-gray-500 bg-dark-bg px-2 py-1 rounded-full">
            Click to add
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {period && <p className="text-xs text-gray-500 mt-1">{period}</p>}
      </div>
    </motion.div>
  )
}

export default StatsCard
