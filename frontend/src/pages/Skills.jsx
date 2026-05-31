import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Brain } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Skills = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

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

  const categories = [
    { value: 'all', label: 'All Skills' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'core', label: 'Core AI' },
    { value: 'tools', label: 'Tools' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const getProgressColor = (progress) => {
    if (progress < 30) return 'from-red-500 to-orange-500'
    if (progress < 70) return 'from-yellow-500 to-orange-500'
    return 'from-green-500 to-emerald-500'
  }

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
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
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
            <div key={i} className="glass rounded-xl p-6 animate-shimmer" />
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
                <div>
                  <h3 className="font-semibold mb-1">{skill.name}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {skill.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{skill.progress}%</p>
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
    </div>
  )
}

export default Skills
