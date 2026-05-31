import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/axios'

const Analytics = () => {
  const { data: productivity } = useQuery({
    queryKey: ['productivity-trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/productivity?period=30')
      return data.data
    }
  })

  const { data: skillAnalytics } = useQuery({
    queryKey: ['skill-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/skills')
      return data.data
    }
  })

  const { data: projectAnalytics } = useQuery({
    queryKey: ['project-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/projects')
      return data.data
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Visualize your AI Engineer journey</p>
      </div>

      {/* Productivity Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Productivity Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productivity || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#13131a',
                border: '1px solid #1f1f28',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="codingHours" stroke="#6366f1" strokeWidth={2} />
            <Line type="monotone" dataKey="researchHours" stroke="#a855f7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Skills by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillAnalytics?.categoryAverages || []}>
              <PolarGrid stroke="#1f1f28" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar name="Progress" dataKey="avgProgress" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Project Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(projectAnalytics?.statusDistribution || {}).map(([status, count]) => ({ status, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" />
              <XAxis dataKey="status" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#13131a',
                  border: '1px solid #1f1f28',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
