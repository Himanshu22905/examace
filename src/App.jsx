import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthSystem from './pages/AuthSystem'
import Dashboard from './pages/Dashboard'
import MockTestInterface from './pages/MockTestInterface'
import AdminPanel from './pages/AdminPanel'
import DailyQuiz from './pages/DailyQuiz'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import Disclaimer from './pages/Disclaimer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<AuthSystem />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test"      element={<MockTestInterface />} />
        <Route path="/daily-quiz" element={<DailyQuiz />} />
        <Route path="/admin" element={<Navigate to="/super-admin" replace />} />
        <Route path="/super-admin" element={<AdminPanel />} />
        <Route path="/admin-direct" element={<AdminPanel allowPasswordFallback={true} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Routes>
    </BrowserRouter>
  )
}
