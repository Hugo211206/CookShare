import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'

export default function UserProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profil, setProfil] = useState(null)
  const [recettes, setRecettes] = useState([])
  const [stats, setStats] = useState({ followers: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [loading, setLoading] = useState(true)
  const called = useRef(false)

  useEffect(() => {
    if (user && String(user.id) === String(id)) {
      navigate('/profile', { replace: true })
    }
  }, [id, user, navigate])

  useEffect(() => {
    if (called.current) return
    called.current = true

    const fetchAll = async () => {
      try {
        const [profilRes, recettesRes, statsRes, followingRes] = await Promise.all([
          api.get(`/utilisateurs/${id}`),
          api.get(`/recettes/auteur/${id}`),
          api.get(`/abonnements/${id}/stats`),
          api.get(`/abonnements/${id}/is-following?abonneId=${user.id}`),
        ])
        setProfil(profilRes.data)
        setRecettes(recettesRes.data)
        setStats(statsRes.data)
        setIsFollowing(followingRes.data.isFollowing)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [id, user.id])

  const handleFollow = async () => {
    setLoadingFollow(true)
    try {
      if (isFollowing) {
        await api.delete(`/abonnements/${id}`, { data: { abonneId: user.id } })
        setIsFollowing(false)
        setStats(s => ({ ...s, followers: s.followers - 1 }))
      } else {
        await api.post(`/abonnements/${id}`, { abonneId: user.id })
        setIsFollowing(true)
        setStats(s => ({ ...s, followers: s.followers + 1 }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFollow(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  if (!profil) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      Utilisateur introuvable
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">@{profil.pseudo}</h1>
      </div>

      {/* Carte profil */}
      <div className="mx-5 mt-4 bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          {profil.photoProfilUrl ? (
            <img src={profil.photoProfilUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              {profil.prenom?.[0]}{profil.nom?.[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800">{profil.prenom} {profil.nom}</h2>
            <p className="text-gray-400 text-sm">@{profil.pseudo}</p>
            {profil.bio && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{profil.bio}</p>}
          </div>
        </div>

        {/* Bouton Follow / Unfollow */}
        <button
          onClick={handleFollow}
          disabled={loadingFollow}
          className={`w-full py-2.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 ${
            isFollowing
              ? 'bg-gray-100 text-gray-600 border border-gray-200'
              : 'text-white'
          }`}
          style={!isFollowing ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
          {loadingFollow ? '...' : isFollowing ? 'Abonné ✓' : '+ Suivre'}
        </button>

        {/* Stats */}
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{recettes.length}</span>
            <span className="text-xs text-gray-400 mt-1">Recettes</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{stats.followers}</span>
            <span className="text-xs text-gray-400 mt-1">Followers</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-800">{stats.following}</span>
            <span className="text-xs text-gray-400 mt-1">Following</span>
          </div>
        </div>
      </div>

      {/* Recettes */}
      <div className="px-5 mt-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Recettes de @{profil.pseudo}
        </p>

        {recettes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Aucune recette</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {recettes.map(recette => (
                <RecipeCard key={recette.id} recette={recette} onClick={() => navigate(`/recette/${recette.id}`)} />
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}