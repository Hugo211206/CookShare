import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'

const TYPE_PLATS = [
  { label: 'Entrée', emoji: '🥗', color: '#10B981', typePlat: 'ENTREE' },
  { label: 'Plat', emoji: '🍝', color: '#EC4899', typePlat: 'PLAT' },
  { label: 'Dessert', emoji: '🍰', color: '#8B5CF6', typePlat: 'DESSERT' },
  { label: 'Snack', emoji: '🍿', color: '#F97316', typePlat: 'SNACK' },
]

export default function ExplorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [cuisines, setCuisines] = useState([])
  const [recommended, setRecommended] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const called = useRef(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const fetchData = async () => {
      try {
        const [cuisinesRes, favorisRes, likesRes, allRecettesRes] = await Promise.all([
          api.get('/cuisines'),
          api.get(`/favoris/auteur/${user.id}`),
          api.get(`/likes/utilisateur/${user.id}`),
          api.get('/recettes')
        ])

        setCuisines(cuisinesRes.data)

        const favoris = favorisRes.data
        const likes = likesRes.data
        const allRecettes = allRecettesRes.data

        // Extraire les cuisineIds et typePlats des favoris et likes
        const cuisineCount = {}
        const typePlatCount = {}

        ;[...favoris, ...likes].forEach(item => {
          const recette = item.recette
          if (recette?.cuisine?.id) {
            cuisineCount[recette.cuisine.id] = (cuisineCount[recette.cuisine.id] || 0) + 1
          }
          if (recette?.typePlat) {
            typePlatCount[recette.typePlat] = (typePlatCount[recette.typePlat] || 0) + 1
          }
        })

        // Cuisines et types préférés
        const topCuisines = Object.entries(cuisineCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => parseInt(id))

        const topTypes = Object.entries(typePlatCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([type]) => type)

        // IDs déjà vus (favoris + likes)
        const seenIds = new Set([
          ...favoris.map(f => f.recette?.id),
          ...likes.map(l => l.recette?.id)
        ])

        // Filtrer les recettes recommandées
        let recs = allRecettes.filter(r =>
          !seenIds.has(r.id) &&
          (topCuisines.includes(r.cuisine?.id) || topTypes.includes(r.typePlat))
        )

        // Si pas assez de recs, compléter avec les autres recettes
        if (recs.length < 4) {
          const others = allRecettes.filter(r => !seenIds.has(r.id) && !recs.find(rec => rec.id === r.id))
          recs = [...recs, ...others].slice(0, 8)
        }

        setRecommended(recs.slice(0, 8))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (value) => {
    setQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (!value.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/recettes/search?query=${value}`)
        setSearchResults(res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const handleCategory = async (typePlat) => {
    try {
      const res = await api.get(`/recettes/type/${typePlat}`)
      setSearchResults(res.data)
      setQuery(typePlat)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCuisine = async (cuisineId) => {
    try {
      const res = await api.get(`/recettes/cuisine/${cuisineId}`)
      setSearchResults(res.data)
      setQuery('cuisine')
    } catch (err) {
      console.error(err)
    }
  }

  const showResults = query.trim().length > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Explore Recipes</h1>

        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 gap-3">
          <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by ingredient, cuisine, or dish..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none flex-1 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearchResults([]) }}>
              <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pt-4">

        {/* Search Results */}
        {showResults ? (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              {searching ? 'Recherche...' : `${searchResults.length} résultat(s)`}
            </h2>
            {searching ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Aucune recette trouvée</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map(recette => (
                  <RecipeCard key={recette.id} recette={recette} onClick={() => navigate(`/recette/${recette.id}`)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Cuisines */}
                <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                <h2 className="text-base font-bold text-gray-800">Cuisines</h2>
                </div>
                <div className="grid grid-cols-7 gap-3 overflow-x-auto max-h-48">
                {cuisines.map((cuisine, i) => {
                const colors = ['#F59E0B','#10B981','#EC4899','#8B5CF6','#F97316','#3B82F6','#22C55E','#06B6D4']
            return (
                <button
                key={cuisine.id}
                onClick={() => handleCuisine(cuisine.id)}
                className="flex flex-col items-center justify-center h-12 rounded-2xl text-white"
                style={{ backgroundColor: colors[i % colors.length] }}>
                <span className="text-2xl mb-1"></span>
                <span className="text-xs font-semibold">{cuisine.nom}</span>
            </button>
            )
            })}
            </div>
            </div>

            {/* Type de plat */}
                <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
                <h2 className="text-base font-bold text-gray-800">Type de plat</h2>
                </div>
                <div className="grid grid-cols-4 gap-3">
            {TYPE_PLATS.map(cat => (
                <button
                key={cat.label}
                onClick={() => handleCategory(cat.typePlat)}
                className="flex flex-col items-center justify-center h-16 rounded-2xl text-white"
                style={{ backgroundColor: cat.color }}>
                <span className="text-2xl mb-1">{cat.emoji}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
                </button>
            ))}
            </div>
            </div>

            {/* Recommended */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg width="18" height="18" fill="none" stroke="#FF6B35" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h2 className="text-base font-bold text-gray-800">For You</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : recommended.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">Likez et sauvegardez des recettes pour des recommandations personnalisées !</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {recommended.map(recette => (
                    <RecipeCard key={recette.id} recette={recette} onClick={() => navigate(`/recette/${recette.id}`)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Navbar />
    </div>
  )
}