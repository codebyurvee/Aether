import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Lightbulb, X, Edit2, Trash2, Star, Sparkles } from 'lucide-react'
import api from '../lib/axios'
import { aiAPI } from '../lib/ai'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Research = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [formData, setFormData] = useState({
    type: 'project-idea',
    title: '',
    description: '',
    content: '',
    tags: ''
  })

  const { data: research, isLoading } = useQuery({
    queryKey: ['research', typeFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (search) params.append('search', search)
      const { data } = await api.get(`/research?${params}`)
      return data.data
    }
  })

  const createMutation = useMutation({
    mutationFn: (newEntry) => api.post('/research', newEntry),
    onSuccess: () => {
      queryClient.invalidateQueries(['research'])
      toast.success('Entry created!')
      setShowModal(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create entry')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/research/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['research'])
      toast.success('Entry updated!')
      setShowEditModal(false)
      setSelectedEntry(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/research/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['research'])
      toast.success('Entry deleted!')
    }
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => api.put(`/research/${id}`, { isFavorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries(['research'])
    }
  })

  const resetForm = () => {
    setFormData({
      type: 'project-idea',
      title: '',
      description: '',
      content: '',
      tags: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const entryData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    }
    createMutation.mutate(entryData)
  }

  const handleEdit = (entry) => {
    setSelectedEntry(entry)
    setFormData({
      type: entry.type,
      title: entry.title,
      description: entry.description || '',
      content: entry.content || '',
      tags: entry.tags?.join(', ') || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const entryData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    }
    updateMutation.mutate({ id: selectedEntry._id, data: entryData })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this entry?')) {
      deleteMutation.mutate(id)
    }
  }

  const types = [
    { value: 'all', label: 'All' },
    { value: 'project-idea', label: 'Project Ideas' },
    { value: 'paper-summary', label: 'Papers' },
    { value: 'startup-idea', label: 'Startups' },
    { value: 'experiment', label: 'Experiments' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Research & Ideas</h1>
          <p className="text-gray-400">Your vault of ideas and experiments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 rounded-lg transition-opacity"
          >
            <Sparkles size={18} />
            AI Summarize
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search research..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                typeFilter === type.value
                  ? 'bg-primary text-white'
                  : 'bg-dark-card hover:bg-dark-hover'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Research Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 h-48 animate-shimmer" />
          ))}
        </div>
      ) : research?.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Lightbulb size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">No research entries found</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Add Your First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {research?.map((entry, index) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass glass-hover rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {entry.type.replace('-', ' ')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavoriteMutation.mutate({ id: entry._id, isFavorite: entry.isFavorite })}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                  >
                    <Star size={16} className={entry.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                  >
                    <Edit2 size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{entry.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-3">{entry.description}</p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-dark-bg text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">New Research Entry</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-hover rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="project-idea">Project Idea</option>
                    <option value="paper-summary">Paper Summary</option>
                    <option value="startup-idea">Startup Idea</option>
                    <option value="experiment">Experiment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    rows="5"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                    placeholder="Detailed notes, findings, or ideas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="AI, ML, NLP (comma separated)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Entry</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-dark-hover rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="project-idea">Project Idea</option>
                    <option value="paper-summary">Paper Summary</option>
                    <option value="startup-idea">Startup Idea</option>
                    <option value="experiment">Experiment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    rows="5"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                    {updateMutation.isPending ? 'Updating...' : 'Update Entry'}
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

export default Research
