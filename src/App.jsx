import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthSystem from './pages/AuthSystem'
import Dashboard from './pages/Dashboard'
import MockTestInterface from './pages/MockTestInterface'
import AdminPanel from './pages/AdminPanel'
import DailyQuiz from './pages/DailyQuiz'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<AuthSystem />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test"      element={<MockTestInterface />} />
        <Route path="/daily-quiz" element={<DailyQuiz />} />
        <Route path="/admin"     element={<AdminPanel />} />
        <Route path="/admin-direct" element={<AdminPanel allowPasswordFallback={true} />} />
      </Routes>
    </BrowserRouter>
  )
}
