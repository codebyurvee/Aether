import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, LayoutGrid, List, X, Edit2, Trash2 } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Projects = () => {
  const queryClient = useQueryClient()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ml',
    status: 'idea',
    priority: 'medium',
    technologies: '',
    progress: 0
  })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)
      const { data } = await api.get(`/projects?${params}`)
      return data.data
    }
  })

  const createMutation = useMutation({
    mutationFn: (newProject) => api.post('/projects', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      toast.success('Project created successfully!')
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        category: 'ml',
        status: 'idea',
        priority: 'medium',
        technologies: '',
        progress: 0
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      toast.success('Project updated successfully!')
      setShowEditModal(false)
      setSelectedProject(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update project')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      toast.success('Project deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t)
    }
    createMutation.mutate(projectData)
  }

  const handleEdit = (project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title,
      description: project.description || '',
      category: project.category,
      status: project.status,
      priority: project.priority,
      technologies: project.technologies?.join(', ') || '',
      progress: project.progress || 0
    })
    setShowEditModal(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t)
    }
    updateMutation.mutate({ id: selectedProject._id, data: projectData })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id)
    }
  }

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'idea', label: 'Idea' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'completed', label: 'Completed' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      idea: 'bg-gray-500/20 text-gray-400',
      planning: 'bg-blue-500/20 text-blue-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      testing: 'bg-purple-500/20 text-purple-400',
      deployed: 'bg-green-500/20 text-green-400',
      completed: 'bg-emerald-500/20 text-emerald-400'
    }
    return colors[status] || colors.idea
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-gray-400">Track your AI/ML projects and experiments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === status.value
                  ? 'bg-primary text-white'
                  : 'bg-dark-card hover:bg-dark-hover'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-primary' : 'bg-dark-card hover:bg-dark-hover'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-primary' : 'bg-dark-card hover:bg-dark-hover'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 h-48 animate-shimmer" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No projects found</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass glass-hover rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg flex-1">{project.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent-purple"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-dark-bg text-xs rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-dark-bg text-xs rounded">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects?.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass glass-hover rounded-xl p-6 flex items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold mb-1">{project.progress}%</p>
                <p className="text-xs text-gray-400">Complete</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  title="Edit Project"
                >
                  <Edit2 size={18} className="text-primary" />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
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
                <h2 className="text-2xl font-bold">Create New Project</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="e.g., Sentiment Analysis with BERT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="ml">Machine Learning</option>
                      <option value="dl">Deep Learning</option>
                      <option value="nlp">NLP</option>
                      <option value="cv">Computer Vision</option>
                      <option value="rl">Reinforcement Learning</option>
                      <option value="mlops">MLOps</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="idea">Idea</option>
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="deployed">Deployed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Technologies</label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Python, PyTorch, Transformers (comma separated)"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate technologies with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Progress: {formData.progress}%</label>
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
                    {createMutation.isPending ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Project</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedProject(null)
                  }}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="e.g., Sentiment Analysis with BERT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="ml">Machine Learning</option>
                      <option value="dl">Deep Learning</option>
                      <option value="nlp">NLP</option>
                      <option value="cv">Computer Vision</option>
                      <option value="rl">Reinforcement Learning</option>
                      <option value="mlops">MLOps</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="idea">Idea</option>
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="deployed">Deployed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Technologies</label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Python, PyTorch, Transformers (comma separated)"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate technologies with commas</p>
                </div>

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
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 h-2 bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent-purple transition-all duration-300"
                      style={{ width: `${formData.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProject(null)
                    }}
                    className="flex-1 px-4 py-2 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update Project'}
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

export default Projects
