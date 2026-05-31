import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { todayString } from '../../utils/dashboardUtils'

const DashboardModal = ({ type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Hours
    hours: '',
    date: todayString(),
    notes: '',
    // Paper
    title: '',
    link: '',
    // Project
    description: '',
    status: 'in-progress',
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (type === 'hours') {
      if (!formData.hours || isNaN(formData.hours) || Number(formData.hours) <= 0)
        newErrors.hours = 'Enter valid hours (e.g. 2.5)'
      if (Number(formData.hours) > 24)
        newErrors.hours = 'Cannot exceed 24 hours'
    }
    if (type === 'paper') {
      if (!formData.title.trim()) newErrors.title = 'Paper title is required'
    }
    if (type === 'project') {
      if (!formData.title.trim()) newErrors.title = 'Project title is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...formData, date: formData.date || todayString() })
  }

  const configs = {
    hours: {
      title: 'Log Coding Hours',
      emoji: '💻',
      color: 'from-primary to-primary-light',
    },
    paper: {
      title: 'Log Paper Read',
      emoji: '📄',
      color: 'from-accent-purple to-accent-pink',
    },
    project: {
      title: 'Create New Project',
      emoji: '🚀',
      color: 'from-accent-cyan to-primary',
    },
  }

  const config = configs[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-2xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}>
              {config.emoji}
            </div>
            <h2 className="text-xl font-bold">{config.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* HOURS FORM */}
          {type === 'hours' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Hours Coded *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className={`w-full bg-dark-bg border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-lg font-semibold ${
                    errors.hours ? 'border-red-500' : 'border-dark-border'
                  }`}
                  placeholder="e.g. 2.5"
                  autoFocus
                />
                {errors.hours && <p className="text-red-400 text-xs mt-1">{errors.hours}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="What did you work on?"
                />
              </div>
            </>
          )}

          {/* PAPER FORM */}
          {type === 'paper' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Paper Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-dark-bg border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors ${
                    errors.title ? 'border-red-500' : 'border-dark-border'
                  }`}
                  placeholder="e.g. Attention Is All You Need"
                  autoFocus
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Paper Link (optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://arxiv.org/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Read</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Key takeaways..."
                />
              </div>
            </>
          )}

          {/* PROJECT FORM */}
          {type === 'project' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-dark-bg border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors ${
                    errors.title ? 'border-red-500' : 'border-dark-border'
                  }`}
                  placeholder="e.g. Sentiment Analysis with BERT"
                  autoFocus
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="What will this project do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="idea">💡 Idea</option>
                  <option value="planning">📋 Planning</option>
                  <option value="in-progress">🔨 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.color} rounded-xl font-semibold transition-all hover:opacity-90 active:scale-95`}
            >
              {type === 'hours' ? 'Log Hours' : type === 'paper' ? 'Log Paper' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DashboardModal
