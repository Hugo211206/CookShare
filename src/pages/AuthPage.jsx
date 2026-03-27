import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import logo from '../assets/logo.png'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', motDePasse: '' })
  const [registerForm, setRegisterForm] = useState({
    prenom: '', nom: '', pseudo: '', email: '', motDePasse: '', confirmPassword: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: loginForm.email,
        motDePasse: loginForm.motDePasse
      })
      login(res.data.token, res.data.utilisateur)
      navigate('/main')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (registerForm.motDePasse !== registerForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        prenom: registerForm.prenom,
        nom: registerForm.nom,
        pseudo: registerForm.pseudo,
        email: registerForm.email,
        motDePasse: registerForm.motDePasse
      })
      setSuccess('Compte créé ! Vérifie ton email pour activer ton compte.')
      setIsLogin(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (toLogin) => {
    setIsLogin(toLogin)
    setError('')
    setSuccess('')
  }

  return (
    
    <div className="min-h-screen bg-white flex items-center justify-center p-5 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-72 h-72 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', opacity: 0.18 }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3"
          style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', opacity: 0.18 }} />

     <div className="flex flex-col items-center justify-center w-96 mr-16">
        <img src={logo} alt="logo" className="w-70 h-70 object-contain" />
        <h1 className="text-5xl font-extrabold mt-4">CookShare</h1>
        <p className="text-gray-400 text-lg mt-2 text-center">Partagez votre passion culinaire</p>
      </div>

      <div className="h-80 w-px bg-gray-200 mr-16" />
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-xl">

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => switchTab(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isLogin ? 'text-white shadow-md' : 'text-gray-400 bg-transparent'}`}
            style={isLogin ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
            Connexion
          </button>
          <button
            onClick={() => switchTab(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${!isLogin ? 'text-white shadow-md' : 'text-gray-400 bg-transparent'}`}
            style={!isLogin ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
            Inscription
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
            {success}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Email</label>
              <input
                type="email"
                placeholder="ton@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.motDePasse}
                onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 rounded-2xl text-white font-bold text-base mt-1 disabled:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', boxShadow: '0 6px 20px rgba(255,107,53,0.35)' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-gray-500">Prénom</label>
                <input
                  type="text"
                  placeholder="Hugo"
                  value={registerForm.prenom}
                  onChange={e => setRegisterForm({ ...registerForm, prenom: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors w-full"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-gray-500">Nom</label>
                <input
                  type="text"
                  placeholder="Lavaud"
                  value={registerForm.nom}
                  onChange={e => setRegisterForm({ ...registerForm, nom: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors w-full"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Pseudo</label>
              <input
                type="text"
                placeholder="@monpseudo"
                value={registerForm.pseudo}
                onChange={e => setRegisterForm({ ...registerForm, pseudo: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Email</label>
              <input
                type="email"
                placeholder="ton@email.com"
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={registerForm.motDePasse}
                onChange={e => setRegisterForm({ ...registerForm, motDePasse: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-500">Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-orange-300 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 rounded-2xl text-white font-bold text-base mt-1 disabled:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30  )', boxShadow: '0 6px 20px rgba(255,107,53,0.35)' }}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}