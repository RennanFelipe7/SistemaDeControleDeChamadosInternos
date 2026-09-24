import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import TicketDetailPage from './pages/TicketDetailPage'
import TicketFormPage from './pages/TicketFormPage'
import TicketsPage from './pages/TicketsPage'
import { api } from './services/api'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null')
  } catch {
    return null
  }
}

function ProtectedRoute({ user, onLogout, children }) {
  if (!user || !localStorage.getItem('auth_token')) return <Navigate to="/login" replace />
  return children({ user, onLogout })
}

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(readStoredUser)

  async function handleLogin(credentials) {
    const data = await api.login(credentials)
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setUser(data.user)
    navigate('/dashboard')
  }

  async function handleLogout() {
    try {
      await api.logout()
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      setUser(null)
      navigate('/login')
    }
  }

  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />} />
    <Route path="/dashboard" element={<ProtectedRoute user={user} onLogout={handleLogout}>{(props) => <DashboardPage {...props} />}</ProtectedRoute>} />
    <Route path="/chamados" element={<ProtectedRoute user={user} onLogout={handleLogout}>{(props) => <TicketsPage {...props} />}</ProtectedRoute>} />
    <Route path="/chamados/novo" element={<ProtectedRoute user={user} onLogout={handleLogout}>{(props) => <TicketFormPage {...props} />}</ProtectedRoute>} />
    <Route path="/chamados/:id/editar" element={<ProtectedRoute user={user} onLogout={handleLogout}>{(props) => <TicketFormPage {...props} />}</ProtectedRoute>} />
    <Route path="/chamados/:id" element={<ProtectedRoute user={user} onLogout={handleLogout}>{(props) => <TicketDetailPage {...props} />}</ProtectedRoute>} />
    <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
  </Routes>
}

export default App
