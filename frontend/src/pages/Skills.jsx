import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Brain, Edit2, Trash2, X } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Skills = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [formData, setFormData] = useState({
    progress: 0,
    masteryLevel: 'beginner',
    totalHours: 0
  })

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills', selectedCategory, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (search) params.append('search', search)
      const { data } = await api.get(`/skills?${params}`)
      return data.data
    }
  })

  const initializeMutation = useMutation({
    mutationFn: () => api.post('/skills/initialize'),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills'])
      toast.success('Skills initialized!')
    },
    onError: (error) => {
      console.error('Initialize error:', error)
      toast.error(error.response?.data?.message || 'Failed to initialize skills')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/skills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills'])
      toast.success('Skill updated!')
      setShowEditModal(false)
      setSelectedSkill(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update skill')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills'])
      toast.success('Skill deleted!')
    }
  })

  const handleEdit = (skill) => {
    setSelectedSkill(skill)
    setFormData({
      progress: skill.progress,
      masteryLevel: skill.masteryLevel,
      totalHours: skill.totalHours
    })
    setShowEditModal(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    updateMutation.mutate({ 
      id: selectedSkill._id, 
      data: {
        ...formData,
        lastPracticed: new Date()
      }
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this skill?')) {
      deleteMutation.mutate(id)
    }
  }

  const categories = [
    { value: 'all', label: 'All Skills' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'core', label: 'Core AI' },
    { value: 'tools', label: 'Tools' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'advanced', label: 'Advanced' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skill Tracker</h1>
          <p className="text-gray-400">Master the skills to become an AI Engineer</p>
        </div>
        <button
          onClick={() => initializeMutation.mutate()}
          disabled={initializeMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          Initialize Skills
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-dark-card hover:bg-dark-hover'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 animate-shimmer h-64" />
          ))}
        </div>
      ) : skills?.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Brain size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">No skills found</p>
          <button
            onClick={() => initializeMutation.mutate()}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Initialize Default Skills
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills?.map((skill, index) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass glass-hover rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{skill.name}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {skill.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-dark-border"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient-${skill._id})"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - skill.progress / 100)}`}
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id={`gradient-${skill._id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-2xl font-bold">{skill.progress}%</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mastery</span>
                  <span className="capitalize">{skill.masteryLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hours</span>
                  <span>{skill.totalHours}h</span>
                </div>
                {skill.lastPracticed && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Practiced</span>
                    <span>{new Date(skill.lastPracticed).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Update {selectedSkill.name}</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-dark-hover rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Progress: <span className="text-primary font-bold">{formData.progress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 h-2 bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent-purple transition-all duration-300"
                      style={{ width: `${formData.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mastery Level</label>
                  <select
                    value={formData.masteryLevel}
                    onChange={(e) => setFormData({ ...formData, masteryLevel: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.totalHours}
                    onChange={(e) => setFormData({ ...formData, totalHours: parseFloat(e.target.value) })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update Skill'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Skills
