import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Phases from './pages/Phases'
import Skills from './pages/Skills'
import Projects from './pages/Projects'
import DeepWork from './pages/DeepWork'
import Career from './pages/Career'
import Research from './pages/Research'
import Brand from './pages/Brand'
import Analytics from './pages/Analytics'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { token } = useAuthStore()
  return !token ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="phases" element={<Phases />} />
        <Route path="skills" element={<Skills />} />
        <Route path="projects" element={<Projects />} />
        <Route path="deep-work" element={<DeepWork />} />
        <Route path="career" element={<Career />} />
        <Route path="research" element={<Research />} />
        <Route path="brand" element={<Brand />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
