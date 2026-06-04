import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Send, Bot, User, Sparkles, BookOpen,
  FolderKanban, Calendar, TrendingUp, Lightbulb,
  Copy, Check, Loader, ChevronDown
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { aiAPI } from '../lib/ai'
import api from '../lib/axios'
import toast from 'react-hot-toast'

// ─── Markdown-like renderer ───────────────────────────────────────────────────
const MessageContent = ({ content }) => {
  const [copied, setCopied] = useState(false)

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format the content with basic markdown
  const formatted = content
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('```')) return null
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-white mt-2">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-disc text-gray-300">{line.slice(2)}</li>
      }
      if (line.startsWith('# ')) {
        return <h3 key={i} className="text-lg font-bold text-white mt-3">{line.slice(2)}</h3>
      }
      if (line.startsWith('## ')) {
        return <h4 key={i} className="font-bold text-primary mt-2">{line.slice(3)}</h4>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-gray-300">{line}</p>
    })

  return <div className="space-y-1 text-sm leading-relaxed">{formatted}</div>
}

// ─── AI Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'chat', label: 'AI Mentor', icon: Bot },
  { id: 'paper', label: 'Paper Summarizer', icon: BookOpen },
  { id: 'ideas', label: 'Project Ideas', icon: FolderKanban },
  { id: 'plan', label: 'Study Plan', icon: Calendar },
  { id: 'analyze', label: 'Progress Analyzer', icon: TrendingUp },
  { id: 'explain', label: 'Explain Concept', icon: Lightbulb },
]

// ─── Main AI Page ─────────────────────────────────────────────────────────────
const AI = () => {
  const [activeTab, setActiveTab] = useState('chat')
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary to-accent-purple rounded-xl">
          <Sparkles size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Aria AI</h1>
          <p className="text-gray-400">Your personal AI Engineering mentor powered by Gemini</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-dark-card hover:bg-dark-hover text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chat' && <ChatTab user={user} />}
          {activeTab === 'paper' && <PaperTab />}
          {activeTab === 'ideas' && <IdeasTab user={user} />}
          {activeTab === 'plan' && <StudyPlanTab user={user} />}
          {activeTab === 'analyze' && <AnalyzeTab user={user} />}
          {activeTab === 'explain' && <ExplainTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
const ChatTab = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm **Aria**, your AI Engineering mentor.\n\nI can help you with:\n- Understanding ML/DL concepts\n- Reviewing your learning progress\n- Explaining research papers\n- Career advice for AI Engineers\n- Code debugging and review\n\nWhat would you like to learn today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const suggestions = [
    'Explain transformer architecture',
    'How to start with PyTorch?',
    'What is RAG in LLMs?',
    'Best way to learn MLOps?',
    'How to prepare for AI interviews?'
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    const userMessage = { id: Date.now(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const { data } = await aiAPI.chat(msg, history)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.data.message
      }])
    } catch (error) {
      const errMsg = error.response?.data?.message || 'AI service unavailable. Check your API key.'
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ ${errMsg}`
      }])
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col" style={{ height: '70vh' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-primary to-accent-purple'
                : 'bg-gradient-to-br from-accent-cyan to-primary'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-primary/20 border border-primary/30 text-right'
                : 'bg-dark-hover border border-dark-border'
            }`}>
              <MessageContent content={msg.content} />
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-dark-hover border border-dark-border px-4 py-3 rounded-2xl">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-dark-border">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-full text-xs whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask Aria anything about AI Engineering..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-3 bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Paper Summarizer Tab ─────────────────────────────────────────────────────
const PaperTab = () => {
  const [form, setForm] = useState({ title: '', url: '', content: '' })
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title && !form.content) {
      toast.error('Enter a paper title or paste the abstract')
      return
    }
    setLoading(true)
    setSummary('')
    try {
      const { data } = await aiAPI.summarizePaper(form.title, form.content, form.url)
      setSummary(data.data.summary)
      toast.success('Paper summarized!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to summarize paper')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-accent-purple" /> Paper Input
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Paper Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              placeholder="Attention Is All You Need"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ArXiv / Paper URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              placeholder="https://arxiv.org/abs/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Abstract / Content (paste here)</label>
            <textarea
              rows="6"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
              placeholder="Paste the abstract or full text here..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <><Loader size={18} className="animate-spin" /> Summarizing...</> : <><Sparkles size={18} /> Summarize with AI</>}
          </button>
        </form>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">AI Summary</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader size={32} className="animate-spin text-primary" />
            <p className="text-gray-400">Aria is reading the paper...</p>
          </div>
        ) : summary ? (
          <div className="overflow-y-auto max-h-[500px]">
            <MessageContent content={summary} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen size={48} className="text-gray-600 mb-3" />
            <p className="text-gray-400">Enter a paper title or paste content to get an AI summary</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Project Ideas Tab ────────────────────────────────────────────────────────
const IdeasTab = ({ user }) => {
  const [interests, setInterests] = useState('')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)

  const { data: skillsData } = useQuery({
    queryKey: ['skills-for-ai'],
    queryFn: async () => {
      const { data } = await api.get('/skills')
      return data.data
    }
  })

  const generate = async () => {
    setLoading(true)
    setIdeas([])
    try {
      const skills = skillsData?.filter(s => s.progress > 20).map(s => s.name) || []
      const { data } = await aiAPI.generateProjectIdeas(skills, user?.currentPhase || 1, interests)
      setIdeas(data.data.ideas)
      toast.success('Ideas generated!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate ideas')
    } finally {
      setLoading(false)
    }
  }

  const difficultyColor = { beginner: 'text-green-400 bg-green-400/10', intermediate: 'text-yellow-400 bg-yellow-400/10', advanced: 'text-red-400 bg-red-400/10' }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FolderKanban size={20} className="text-accent-cyan" /> Generate Project Ideas
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="Your interests (e.g., healthcare AI, chatbots, image generation...)"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-cyan to-primary rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          AI will suggest ideas based on your Phase {user?.currentPhase || 1} level and current skills
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={36} className="animate-spin text-primary" />
          <p className="text-gray-400">Aria is thinking of perfect projects for you...</p>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass glass-hover rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg leading-tight">{idea.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${difficultyColor[idea.difficulty] || difficultyColor.intermediate}`}>
                  {idea.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{idea.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {idea.technologies?.map((tech, j) => (
                  <span key={j} className="px-2 py-0.5 bg-dark-bg text-xs rounded-full">{tech}</span>
                ))}
              </div>
              <div className="border-t border-dark-border pt-3 space-y-1">
                <p className="text-xs text-gray-400">⏱ {idea.estimatedTime}</p>
                <p className="text-xs text-primary">🎯 {idea.learningOutcome}</p>
              </div>
              {idea.steps?.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                    View Steps ({idea.steps.length})
                  </summary>
                  <ol className="mt-2 space-y-1">
                    {idea.steps.map((step, k) => (
                      <li key={k} className="text-xs text-gray-300 flex gap-2">
                        <span className="text-primary font-bold">{k + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Study Plan Tab ───────────────────────────────────────────────────────────
const StudyPlanTab = ({ user }) => {
  const [form, setForm] = useState({ hoursPerDay: 4, goals: '' })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const { data: skillsData } = useQuery({
    queryKey: ['skills-for-plan'],
    queryFn: async () => {
      const { data } = await api.get('/skills')
      return data.data
    }
  })

  const generate = async () => {
    setLoading(true)
    setPlan(null)
    try {
      const skills = skillsData?.map(s => s.name) || []
      const { data } = await aiAPI.generateStudyPlan(skills, user?.currentPhase || 1, form.hoursPerDay, form.goals)
      setPlan(data.data.plan)
      toast.success('Study plan generated!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" /> Personalized Study Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hours per day</label>
            <input
              type="number"
              min="1"
              max="12"
              value={form.hoursPerDay}
              onChange={(e) => setForm({ ...form, hoursPerDay: parseInt(e.target.value) })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Your goal this week</label>
            <input
              type="text"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              placeholder="e.g., understand transformers, build a chatbot..."
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent-purple rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Creating plan...' : 'Generate My Study Plan'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={36} className="animate-spin text-primary" />
          <p className="text-gray-400">Aria is creating your personalized weekly plan...</p>
        </div>
      )}

      {plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-primary mb-1">{plan.weekTheme}</h3>
            <p className="text-gray-400 text-sm mb-4">{plan.dailyGoal}</p>
            {plan.weeklyProject && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4">
                <p className="text-sm font-medium text-primary">🚀 Weekly Project: {plan.weeklyProject}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.days?.map((day, i) => (
                <div key={i} className="bg-dark-bg rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">{day.day}</h4>
                    <span className="text-xs text-gray-400">{day.focus}</span>
                  </div>
                  <div className="space-y-2">
                    {day.tasks?.map((task, j) => (
                      <div key={j} className="text-xs">
                        <span className="text-primary font-medium">{task.time}</span>
                        <span className="text-gray-300 ml-2">{task.task}</span>
                        {task.resource && <p className="text-gray-500 mt-0.5 ml-0">📚 {task.resource}</p>}
                      </div>
                    ))}
                  </div>
                  {day.milestone && (
                    <p className="text-xs text-green-400 mt-2 border-t border-dark-border pt-2">✅ {day.milestone}</p>
                  )}
                </div>
              ))}
            </div>
            {plan.resources?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-border">
                <p className="text-sm font-medium mb-2">Resources for this week:</p>
                <div className="flex flex-wrap gap-2">
                  {plan.resources.map((r, i) => (
                    <span key={i} className="px-3 py-1 bg-dark-bg text-xs rounded-full text-gray-300">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Progress Analyzer Tab ────────────────────────────────────────────────────
const AnalyzeTab = ({ user }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const { data: skillsData } = useQuery({
    queryKey: ['skills-for-analyze'],
    queryFn: async () => {
      const { data } = await api.get('/skills')
      return data.data
    }
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-analyze'],
    queryFn: async () => {
      const { data } = await api.get('/projects')
      return data.data
    }
  })

  const analyze = async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const aiScore = parseInt(localStorage.getItem('aether_ai_score') || '0')
      const hoursLog = JSON.parse(localStorage.getItem('aether_hours_log') || '[]')
      const streak = parseInt(localStorage.getItem('aether_streak') || '0')
      const weeklyHours = hoursLog.slice(-7).reduce((sum, h) => sum + Number(h.hours), 0)

      const { data } = await aiAPI.analyzeProgress({
        skills: skillsData || [],
        projects: projectsData || [],
        weeklyHours,
        streak,
        aiScore,
        phase: user?.currentPhase || 1
      })
      setAnalysis(data.data.analysis)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze progress')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-400" /> AI Progress Analysis
        </h2>
        <p className="text-gray-400 text-sm mb-4">Aria will analyze your skills, projects, and habits to give personalized feedback</p>
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analyzing...' : 'Analyze My Progress'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={36} className="animate-spin text-green-400" />
          <p className="text-gray-400">Aria is analyzing your journey...</p>
        </div>
      )}

      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">{analysis.overallAssessment}</p>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <p className="text-primary font-medium text-sm">⏰ Estimated time to job-ready: {analysis.estimatedTimeToJob}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-3">💪 Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-bold text-orange-400 mb-3">🎯 Areas to Improve</h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-orange-400">→</span>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-3">🚀 Next Steps</h3>
            <div className="space-y-2">
              {analysis.nextSteps?.map((step, i) => (
                <div key={i} className="flex gap-3 p-3 bg-dark-bg rounded-lg">
                  <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
          {analysis.weeklyGoal && (
            <div className="glass rounded-xl p-5 border border-primary/30">
              <h3 className="font-bold text-primary mb-2">🎯 This Week's Focus</h3>
              <p className="text-gray-300">{analysis.weeklyGoal}</p>
            </div>
          )}
          {analysis.motivationalMessage && (
            <div className="glass rounded-xl p-5 text-center">
              <p className="text-lg italic text-gray-300">"{analysis.motivationalMessage}"</p>
              <p className="text-sm text-gray-500 mt-1">— Aria, your AI mentor</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ─── Explain Concept Tab ──────────────────────────────────────────────────────
const ExplainTab = () => {
  const [concept, setConcept] = useState('')
  const [level, setLevel] = useState('intermediate')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const popularConcepts = [
    'Attention Mechanism', 'Gradient Descent', 'Backpropagation',
    'Transformer Architecture', 'RLHF', 'RAG', 'Vector Embeddings',
    'Batch Normalization', 'Dropout', 'Fine-tuning LLMs'
  ]

  const explain = async (text) => {
    const c = text || concept
    if (!c.trim()) {
      toast.error('Enter a concept to explain')
      return
    }
    setLoading(true)
    setExplanation('')
    try {
      const { data } = await aiAPI.explainConcept(c.trim(), level)
      setExplanation(data.data.explanation)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to explain concept')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-400" /> Concept Explainer
        </h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && explain()}
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="Enter any AI/ML concept..."
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            onClick={() => explain()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Explain
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularConcepts.map((c, i) => (
            <button
              key={i}
              onClick={() => { setConcept(c); explain(c) }}
              className="px-3 py-1 bg-dark-bg border border-dark-border rounded-full text-xs hover:border-primary hover:text-primary transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={36} className="animate-spin text-yellow-400" />
          <p className="text-gray-400">Aria is preparing the explanation...</p>
        </div>
      )}

      {explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-yellow-400">{concept}</h3>
          <MessageContent content={explanation} />
        </motion.div>
      )}
    </div>
  )
}

export default AI
