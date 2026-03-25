import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import MainPage from './pages/MainPage'
import ExplorePage from './pages/ExplorePage'
import LivePage from './pages/LivePage'
import ProfilePage from './pages/ProfilePage'
import ConfigPage from './pages/ConfigPage'
import VerifyPage from './pages/VerifyPage'
import CreateRecipePage from './pages/CreateRecipePage'
import RecettePage from './pages/RecettePage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LivePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateRecipePage /></ProtectedRoute>} />
          <Route path="/recette/:id" element={<ProtectedRoute><RecettePage /></ProtectedRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App