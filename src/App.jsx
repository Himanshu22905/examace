import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthSystem from './pages/AuthSystem'
import Dashboard from './pages/Dashboard'
import MockTestInterface from './pages/MockTestInterface'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import AdminPanel from './pages/AdminPanel'
import AIQuestionGenerator from './pages/AIQuestionGenerator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'          element={<LandingPage />} />
        <Route path='/login'     element={<AuthSystem />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/test'      element={<MockTestInterface />} />
        <Route path='/analytics' element={<AnalyticsDashboard />} />
        <Route path='/admin'     element={<AdminPanel />} />
        <Route path='/ai-generator' element={<AIQuestionGenerator />} />
      </Routes>
    </BrowserRouter>
  )
}