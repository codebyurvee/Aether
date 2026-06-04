import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../lib/axios'

const Analytics = () => {
  const [period, setPeriod] = useState('30')

  const { data: productivity, isLoading: loadingProd } = useQuery({
    queryKey: ['productivity-trends', period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/productivity?period=${period}`)
      return data.data
    }
  })

  const { data: skillAnalytics, isLoading: loadingSkills } = useQuery({
    queryKey: ['skill-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/skills')
      return data.data
    }
  })

  const { data: projectAnalytics, isLoading: loadingProjects } = useQuery({
    queryKey: ['project-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/projects')
      return data.data
    }
  })

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard')
      return data.data
    }
  })

  const periods = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
  ]

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#13131a',
      border: '1px solid #1f1f28',
      borderRadius: '8px',
      color: '#fff'
    }
  }

  const radarData = skillAnalytics?.categoryAverages?.map(c => ({
    category: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    progress: Math.round(c.avgProgress)
  })) || []

  const projectStatusData = Object.entries(projectAnalytics?.statusDistribution || {}).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-400">Visualize your AI Engineer journey</p>
        </div>
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-dark-card rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Skill Progress', value: `${dashboard?.avgSkillProgress || 0}%`, color: 'text-primary' },
          { label: 'AI Readiness Score', value: `${dashboard?.aiReadinessScore || 0}`, color: 'text-accent-purple' },
          { label: 'Active Projects', value: dashboard?.activeProjects || 0, color: 'text-accent-cyan' },
          { label: 'Current Streak', value: `${dashboard?.streak?.current || 0} days`, color: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Productivity Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Productivity Trend</h3>
        {loadingProd ? (
          <div className="h-64 animate-shimmer rounded-lg" />
        ) : productivity?.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No data yet</p>
              <p className="text-sm text-gray-500">Start logging work sessions from Deep Work page</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="codingHours" stroke="#6366f1" strokeWidth={2} name="Coding Hours" dot={false} />
              <Line type="monotone" dataKey="researchHours" stroke="#a855f7" strokeWidth={2} name="Research Hours" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Skills by Category</h3>
          {loadingSkills ? (
            <div className="h-64 animate-shimmer rounded-lg" />
          ) : radarData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Initialize skills to see radar chart</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f1f28" />
                <PolarAngleAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Radar name="Progress" dataKey="progress" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Project Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
          {loadingProjects ? (
            <div className="h-64 animate-shimmer rounded-lg" />
          ) : projectStatusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Create projects to see distribution</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" />
                <XAxis dataKey="status" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
