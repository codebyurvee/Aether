import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, Circle, Edit2, X, Plus } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Phases = () => {
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [formData, setFormData] = useState({ progress: 0 })

  const { data: phases, isLoading } = useQuery({
    queryKey: ['phases'],
    queryFn: async () => {
      const { data } = await api.get('/phases')
      return data.data
    }
  })

  const initializeMutation = useMutation({
    mutationFn: () => api.post('/phases/initialize'),
    onSuccess: () => {
      queryClient.invalidateQueries(['phases'])
      toast.success('Phases initialized!')
    },
    onError: (error) => {
      console.error('Initialize error:', error)
      toast.error(error.response?.data?.message || 'Failed to initialize phases')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/phases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['phases'])
      toast.success('Phase updated!')
      setShowEditModal(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update phase')
    }
  })

  const toggleTaskMutation = useMutation({
    mutationFn: ({ phaseId, taskId, completed }) => {
      return api.put(`/phases/${phaseId}`, {
        tasks: phases.find(p => p._id === phaseId).tasks.map(t => 
          t._id === taskId ? { ...t, completed, completedAt: completed ? new Date() : null } : t
        )
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['phases'])
      toast.success('Task updated!')
    }
  })

  const handleEdit = (phase) => {
    setSelectedPhase(phase)
    setFormData({ progress: phase.progress || 0 })
    setShowEditModal(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    updateMutation.mutate({ id: selectedPhase._id, data: formData })
  }

  const toggleTask = (phaseId, taskId, currentStatus) => {
    toggleTaskMutation.mutate({ phaseId, taskId, completed: !currentStatus })
  }

  const phaseColors = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-orange-500 to-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Life Phases</h1>
          <p className="text-gray-400">Your structured path to becoming an AI Engineer</p>
        </div>
        {(!phases || phases.length === 0) && (
          <button
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
          >
            Initialize Phases
          </button>
        )}
      </div>

      {/* Phases */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 h-64 animate-shimmer" />
          ))}
        </div>
      ) : phases?.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Target size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">No phases found</p>
          <button
            onClick={() => initializeMutation.mutate()}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Initialize Default Phases
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {phases?.map((phase, index) => (
            <motion.div
              key={phase._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-xl p-6 ${phase.isActive ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${phaseColors[phase.phaseNumber]} flex items-center justify-center text-2xl font-bold`}>
                    {phase.phaseNumber}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{phase.title}</h2>
                    <p className="text-gray-400">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {phase.isActive && (
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(phase)}
                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                    title="Edit Progress"
                  >
                    <Edit2 size={18} className="text-primary" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">{phase.progress}%</span>
                </div>
                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${phaseColors[phase.phaseNumber]} transition-all duration-500`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>

              {/* Goals */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {phase.goals?.map((goal, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              {phase.tasks && phase.tasks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tasks</h3>
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <button
                        key={task._id}
                        onClick={() => toggleTask(phase._id, task._id, task.completed)}
                        className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-lg hover:bg-dark-hover transition-colors text-left"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
                        ) : (
                          <Circle size={20} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className={task.completed ? 'line-through text-gray-400' : ''}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedPhase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Update Phase {selectedPhase.phaseNumber}</h2>
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
                    onChange={(e) => setFormData({ progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 h-2 bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${phaseColors[selectedPhase.phaseNumber]} transition-all duration-300`}
                      style={{ width: `${formData.progress}%` }}
                    />
                  </div>
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
                    {updateMutation.isPending ? 'Updating...' : 'Update Phase'}
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

export default Phases
