import { motion } from 'framer-motion'

const AIScoreRing = ({ score }) => {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getScoreColor = (s) => {
    if (s < 30) return ['#ef4444', '#f97316']
    if (s < 60) return ['#f59e0b', '#eab308']
    if (s < 80) return ['#6366f1', '#a855f7']
    return ['#10b981', '#06b6d4']
  }

  const [c1, c2] = getScoreColor(score)

  const getLabel = (s) => {
    if (s < 20) return 'Just Starting'
    if (s < 40) return 'Beginner'
    if (s < 60) return 'Intermediate'
    if (s < 80) return 'Advanced'
    return 'Expert'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="transform -rotate-90 w-44 h-44">
          {/* Background circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="#1f1f28"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            stroke={`url(#score-gradient)`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.p
            className="text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.p>
          <p className="text-xs text-gray-400">out of 100</p>
        </div>
      </div>
      <p className="text-sm font-medium mt-2" style={{ color: c1 }}>
        {getLabel(score)}
      </p>
    </div>
  )
}

export default AIScoreRing
