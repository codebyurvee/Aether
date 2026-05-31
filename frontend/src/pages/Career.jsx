import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Briefcase, X, Edit2, Trash2 } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Career = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [formData, setFormData] = useState({
    type: 'job',
    company: '',
    position: '',
    location: '',
    status: 'wishlist',
    salary: ''
  })

  const { data: careers, isLoading } = useQuery({
    queryKey: ['career'],
    queryFn: async () => {
      const { data } = await api.get('/career')
      return data.data
    }
  })

  const createMutation = useMutation({
    mutationFn: (newCareer) => api.post('/career', newCareer),
    onSuccess: () => {
      queryClient.invalidateQueries(['career'])
      toast.success('Application added!')
      setShowModal(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add application')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/career/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['career'])
      toast.success('Application updated!')
      setShowEditModal(false)
      setSelectedCareer(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/career/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['career'])
      toast.success('Application deleted!')
    }
  })

  const resetForm = () => {
    setFormData({
      type: 'job',
      company: '',
      position: '',
      location: '',
      status: 'wishlist',
      salary: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const careerData = {
      ...formData,
      salary: formData.salary ? { amount: parseFloat(formData.salary), currency: 'INR' } : undefined
    }
    createMutation.mutate(careerData)
  }

  const handleEdit = (career) => {
    setSelectedCareer(career)
    setFormData({
      type: career.type,
      company: career.company,
      position: career.position,
      location: career.location || '',
      status: career.status,
      salary: career.salary?.amount || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const careerData = {
      ...formData,
      salary: formData.salary ? { amount: parseFloat(formData.salary), currency: 'INR' } : undefined
    }
    updateMutation.mutate({ id: selectedCareer._id, data: careerData })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this application?')) {
      deleteMutation.mutate(id)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      wishlist: 'bg-gray-500/20 text-gray-400',
      applied: 'bg-blue-500/20 text-blue-400',
      screening: 'bg-yellow-500/20 text-yellow-400',
      interview: 'bg-purple-500/20 text-purple-400',
      offer: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      accepted: 'bg-emerald-500/20 text-emerald-400'
    }
    return colors[status] || colors.wishlist
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Career Tracker</h1>
          <p className="text-gray-400">Track job applications and interviews</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Application
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 h-32 animate-shimmer" />
          ))}
        </div>
      ) : careers?.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">No applications yet</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Add Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {careers?.map((career, index) => (
            <motion.div
              key={career._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass glass-hover rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{career.position}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(career.status)}`}>
                      {career.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2">{career.company}</p>
                  {career.location && (
                    <p className="text-sm text-gray-500">{career.location}</p>
                  )}
                </div>
                <div className="flex items-start gap-4">
                  {career.salary?.amount && (
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {career.salary.currency} {career.salary.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Expected</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(career)}
                      className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(career._id)}
                      className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
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
              className="glass rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Application</h2>
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
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="AI Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Bangalore, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expected Salary (INR)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="1200000"
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
                    {createMutation.isPending ? 'Adding...' : 'Add Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedCareer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Application</h2>
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
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expected Salary (INR)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
                    {updateMutation.isPending ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      )}
    </div>
  )
}

export default Career
