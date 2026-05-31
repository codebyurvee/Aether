import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Circle } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Phases = () => {
  const queryClient = useQueryClient()

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
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
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
                {phase.isActive && (
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    Active
                  </span>
                )}
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
                      <div key={task._id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-primary" />
                        ) : (
                          <Circle size={20} className="text-gray-400" />
                        )}
                        <span className={task.completed ? 'line-through text-gray-400' : ''}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Phases
