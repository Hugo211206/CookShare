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
  const [allRecettes, setAllRecettes] = useState([])
  const [recommended, setRecommended] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState(null)
  const [filterDiff, setFilterDiff] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)
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
        setAllRecettes(allRecettes)

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

        const topCuisines = Object.entries(cuisineCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => parseInt(id))

        const topTypes = Object.entries(typePlatCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([type]) => type)

        const seenIds = new Set([
          ...favoris.map(f => f.recette?.id),
          ...likes.map(l => l.recette?.id)
        ])

        let recs = allRecettes.filter(r =>
          !seenIds.has(r.id) &&
          (topCuisines.includes(r.cuisine?.id) || topTypes.includes(r.typePlat))
        )

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

  const applyFilters = (list) => {
    let result = [...list]
    if (filterType) result = result.filter(r => r.typePlat === filterType)
    if (filterDiff) result = result.filter(r => r.difficulte === filterDiff)
    if (sortBy === 'popularite') result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    else result.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication))
    return result
  }

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
        const [titreRes, auteurRes, ingredientRes] = await Promise.allSettled([
          api.get(`/recettes/search?titre=${value}`),
          api.get(`/recettes/search/auteur?pseudo=${value}`),
          api.get(`/recettes/search/ingredient?nom=${value}`),
        ])

        const titreIds = new Set((titreRes.status === 'fulfilled' ? titreRes.value.data : []).map(r => r.id))
        const auteurIds = new Set((auteurRes.status === 'fulfilled' ? auteurRes.value.data : []).map(r => r.id))
        const ingredientIds = new Set((ingredientRes.status === 'fulfilled' ? ingredientRes.value.data : []).map(r => r.id))

        const all = [
          ...(titreRes.status === 'fulfilled' ? titreRes.value.data : []),
          ...(auteurRes.status === 'fulfilled' ? auteurRes.value.data : []),
          ...(ingredientRes.status === 'fulfilled' ? ingredientRes.value.data : []),
        ]
        const seen = new Set()
        const merged = all
          .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
          .map(r => ({
            ...r,
            _matchTitre: titreIds.has(r.id),
            _matchAuteur: auteurIds.has(r.id),
            _matchIngredient: ingredientIds.has(r.id),
          }))
        setSearchResults(merged)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const handleCategory = async (typePlat) => {
    setFilterType(typePlat)
    setQuery(typePlat)
    try {
      const res = await api.get(`/recettes/type/${typePlat}`)
      setSearchResults(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCuisine = async (cuisineId, cuisineNom) => {
    setQuery(cuisineNom)
    try {
      const res = await api.get(`/recettes/cuisine/${cuisineId}`)
      setSearchResults(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const clearFilters = () => {
    setFilterType(null)
    setFilterDiff(null)
    setSortBy('date')
  }

  const activeFilterCount = [filterType, filterDiff, sortBy !== 'date' ? sortBy : null].filter(Boolean).length
  const displayedResults = applyFilters(searchResults)
  const showResults = query.trim().length > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-40 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Explore Recipes</h1>

        <div className="flex gap-2">
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 gap-3 flex-1">
            <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by ingredient, cuisine..."
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
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center relative flex-shrink-0 transition-all ${showFilters ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
            style={showFilters ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Type de plat</p>
              <div className="flex gap-2 flex-wrap">
                {TYPE_PLATS.map(t => (
                  <button
                    key={t.typePlat}
                    onClick={() => setFilterType(filterType === t.typePlat ? null : t.typePlat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === t.typePlat ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={filterType === t.typePlat ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Difficulté</p>
              <div className="flex gap-2">
                {[['FACILE', '🟢'], ['MOYEN', '🟠'], ['DIFFICILE', '🔴']].map(([d, emoji]) => (
                  <button
                    key={d}
                    onClick={() => setFilterDiff(filterDiff === d ? null : d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterDiff === d ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={filterDiff === d ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {emoji} {d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Trier par</p>
              <div className="flex gap-2">
                {[['date', '🕐 Date'], ['popularite', '🔥 Popularité']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sortBy === val ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={sortBy === val ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-400 font-semibold">
                Effacer tous les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-5 pt-4">

        {showResults ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-700">
                {searching ? 'Recherche...' : `${displayedResults.length} résultat(s)`}
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-orange-500 font-semibold">
                  Effacer filtres
                </button>
              )}
            </div>
            {searching ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : displayedResults.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Aucune recette trouvée</p>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {displayedResults.map(recette => (
                  <div key={recette.id} className="relative">
                    <RecipeCard recette={recette} onClick={() => navigate(`/recette/${recette.id}`)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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
                onClick={() => handleCuisine(cuisine.id, cuisine.nom)}
                className="flex flex-col items-center justify-center h-12 rounded-2xl text-white"
                style={{ backgroundColor: colors[i % colors.length] }}>
                <span className="text-2xl mb-1"></span>
                <span className="text-xs font-semibold">{cuisine.nom}</span>
            </button>
            )
            })}
            </div>
            </div>

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
                <div className="grid grid-cols-3 gap-4">
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