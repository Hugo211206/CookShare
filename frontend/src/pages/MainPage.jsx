import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../context/AuthContext'

export default function MainPage() {
  const { user } = useAuth()
  const [recettes, setRecettes] = useState([])
  const [feed, setFeed] = useState([])
  const [activeTab, setActiveTab] = useState('pourToi')
  const [loading, setLoading] = useState(true)
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/recettes')
      .then(res => setRecettes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab !== 'abonnements') return
    setLoadingFeed(true)
    api.get(`/abonnements/feed?userId=${user.id}`)
      .then(res => setFeed(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingFeed(false))
  }, [activeTab, user.id])

  const filtered = recettes.filter(r =>
    r.titre?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredFeed = feed.filter(r =>
    r.titre?.toLowerCase().includes(search.toLowerCase())
  )

  const isLoadingCurrent = activeTab === 'pourToi' ? loading : loadingFeed
  const currentList = activeTab === 'pourToi' ? filtered : filteredFeed

  const toggleFavori = async (e, recetteId) => {
    e.stopPropagation()
    try {
      await api.post(`/favoris/recette/${recetteId}`)
      setRecettes(prev => prev.map(r =>
        r.id === recetteId ? { ...r, isFavori: !r.isFavori } : r
      ))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <div className="bg-white px-5 pt-6 pb-4 sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold"
            style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CookShare
          </h1>
          <button className="relative">
            <svg width="30" height="30" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 gap-3">
          <svg width="24" height="24" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search recipes, chefs, ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none flex-1 placeholder-gray-400"
          />
        </div>

        <div className="flex mt-4 gap-1 bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('pourToi')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pourToi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>
            Pour toi
          </button>
          <button
            onClick={() => setActiveTab('abonnements')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'abonnements' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>
            Abonnements
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">

        {isLoadingCurrent ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {activeTab === 'abonnements' ? (
              <>
                <p className="text-3xl mb-3">👨‍🍳</p>
                <p className="font-semibold text-gray-500">Aucune recette pour l'instant</p>
                <p className="text-sm mt-1">Suis des chefs pour voir leurs recettes ici</p>
              </>
            ) : (
              <p className="text-lg">Aucune recette trouvée</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
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