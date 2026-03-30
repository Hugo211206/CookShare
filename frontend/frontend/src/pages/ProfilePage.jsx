import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profil, setProfil] = useState(null)
  const [recettes, setRecettes] = useState([])
  const [favoris, setFavoris] = useState([])
  const [liked, setLiked] = useState([])
  const [activeTab, setActiveTab] = useState('recettes, favoris')
  const [loading, setLoading] = useState(true)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const fetchAll = async () => {
      try {
        const [profilRes, recettesRes, favorisRes, likedRes] = await Promise.all([
          api.get(`/utilisateurs/${user.id}`),
          api.get(`/recettes/auteur/${user.id}`),
          api.get(`/favoris/auteur/${user.id}`),
          api.get(`/likes/utilisateur/${user.id}`)
        ])
        setProfil(profilRes.data)
        setRecettes(recettesRes.data)
        setFavoris(favorisRes.data.map(f => f.recette))
        setLiked(likedRes.data.map(l => l.recette))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const currentList = activeTab === 'recettes' ? recettes : activeTab === 'favoris' ? favoris : liked

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/config')}>
            <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
          <button onClick={() => { logout(); navigate('/auth') }}>
            <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {profil?.photoProfilUrl ? (
              <img src={profil.photoProfilUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
                {profil?.prenom?.[0]}{profil?.nom?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{profil?.prenom} {profil?.nom}</h2>
            <p className="text-gray-400 text-sm">@{profil?.pseudo}</p>
            {profil?.bio && <p className="text-gray-600 text-sm mt-1">{profil.bio}</p>}
          </div>
        </div>

        <button
          onClick={() => navigate('/config')}
          className="w-full py-2.5 rounded-2xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
          Edit Profile
        </button>

        <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <svg width="18" height="18" fill="none" stroke="#F25C05" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span className="text-xl font-bold text-gray-800">{recettes.length}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">Recipes</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <svg width="18" height="18" fill="none" stroke="#F25C05" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span className="text-xl font-bold text-gray-800">0</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <svg width="18" height="18" fill="none" stroke="#F25C05" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span className="text-xl font-bold text-gray-800">0</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">Following</span>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-4 bg-white rounded-2xl flex overflow-hidden shadow-sm">
        {[
          { key: 'recettes', label: 'My Recipes', icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          )},
          { key: 'liked', label: 'Liked', icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          )},
          { key: 'favoris', label: 'Saved', icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          )},
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all ${activeTab === tab.key ? 'text-white' : 'text-gray-400 bg-transparent'}`}
            style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4">
        {currentList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Aucune recette</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {currentList.map(recette => (
              <RecipeCard key={recette.id} recette={recette} onClick={() => navigate(`/recette/${recette.id}`)} />
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}