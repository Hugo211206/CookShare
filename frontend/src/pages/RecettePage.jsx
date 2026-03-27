import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function RecettePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recette, setRecette] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [favori, setFavori] = useState(false)
  const [commentaires, setCommentaires] = useState([])
  const [commentCount, setCommentCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const called = useRef(false)
  const [mediaIndex, setMediaIndex] = useState(0)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const fetchAll = async () => {
      try {
        const [recetteRes, likeCountRes, isLikedRes, isFavoriRes, commentsRes, commentCountRes] = await Promise.all([
          api.get(`/recettes/${id}`),
          api.get(`/likes/recette/${id}/count`),
          api.get(`/likes/recette/${id}/utilisateur/${user.id}`),
          api.get(`/favoris/recette/${id}/auteur/${user.id}`),
          api.get(`/commentaires/recette/${id}`),
          api.get(`/commentaires/recette/${id}/count`)
        ])
        setRecette(recetteRes.data)
        setLikeCount(likeCountRes.data)
        setLiked(isLikedRes.data.hasLiked)
        setFavori(isFavoriRes.data.inFavoris)
        setCommentaires(commentsRes.data)
        setCommentCount(commentCountRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [id])

  const toggleLike = async () => {
    try {
      await api.post(`/likes/recette/${id}`, { utilisateurId: user.id })
      setLiked(prev => !prev)
      setLikeCount(prev => liked ? prev - 1 : prev + 1)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleFavori = async () => {
    try {
      await api.post(`/favoris/recette/${id}`, { auteurId: user.id })
      setFavori(prev => !prev)
    } catch (err) {
      console.error(err)
    }
  }

  const sendComment = async () => {
    console.log('newComment:', newComment)
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const res = await api.post(`/commentaires/recette/${id}`, { auteurId: user.id , contenu: newComment })
      setCommentaires(prev => [...prev, res.data])
      setCommentCount(prev => prev + 1)
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setSendingComment(false)
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/commentaires/${commentId}?utilisateurId=${user.id}`)
      setCommentaires(prev => prev.filter(c => c.id !== commentId))
      setCommentCount(prev => prev - 1)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  if (!recette) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Recette introuvable</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
<div className="relative h-56 bg-gray-200">
  {recette.medias?.length > 0 ? (
    <>
      {recette.medias[mediaIndex].type === 'VIDEO' ? (
        <video
          src={recette.medias[mediaIndex].url}
          className="w-full h-full object-cover"
          controls
        />
      ) : (
        <img
          src={recette.medias[mediaIndex].url}
          alt={recette.titre}
          className="w-full h-full object-cover"
        />
      )}

      {/* Arrows */}
      {recette.medias.length > 1 && (
        <>
          <button
            onClick={() => setMediaIndex(prev => prev === 0 ? recette.medias.length - 1 : prev - 1)}
            className="absolute left-14 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => setMediaIndex(prev => prev === recette.medias.length - 1 ? 0 : prev + 1)}
            className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {recette.medias.length > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
          {recette.medias.map((_, i) => (
            <button
              key={i}
              onClick={() => setMediaIndex(i)}
              className={`rounded-full transition-all ${i === mediaIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white bg-opacity-50'}`}
            />
          ))}
        </div>
      )}
    </>
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100">
      <span className="text-6xl">🍽️</span>
    </div>
  )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <svg width="20" height="20" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={toggleFavori}
          className="absolute top-12 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <svg width="20" height="20" fill={favori ? '#FF6B35' : 'none'} stroke={favori ? '#FF6B35' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      <div className="px-5 pt-5">

        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-bold text-gray-800 flex-1">{recette.titre}</h1>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
              {recette.difficulte}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {recette.typePlat && (
              <span className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-xs font-medium">
                {recette.typePlat}
              </span>
            )}
            {recette.cuisine && (
              <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-xs font-medium">
                {recette.cuisine.nom}
              </span>
            )}
          </div>

          {recette.auteur && (
            <div
              className="flex items-center gap-3 pb-4 border-b border-gray-100 cursor-pointer"
              onClick={() => navigate(`/profil/${recette.auteur.id}`)}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
                {recette.auteur.prenom?.[0]}{recette.auteur.nom?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{recette.auteur.prenom} {recette.auteur.nom}</p>
                <p className="text-gray-400 text-xs">@{recette.auteur.pseudo}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pt-4">
            <button onClick={toggleLike} className="flex items-center gap-2">
              <svg width="22" height="22" fill={liked ? '#FF3CAC' : 'none'} stroke={liked ? '#FF3CAC' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span className={`text-sm font-semibold ${liked ? 'text-pink-500' : 'text-gray-400'}`}>{likeCount}</span>
            </button>
            <div className="flex items-center gap-2">
              <svg width="22" height="22" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-400">{commentCount}</span>
            </div>
          </div>
        </div>

        {recette.description && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <h2 className="text-base font-bold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{recette.description}</p>
          </div>
        )}

        {recette.ingredients?.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <h2 className="text-base font-bold text-gray-800 mb-3">Ingrédients</h2>
            <div className="flex flex-col gap-2">
              {recette.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700 text-sm">{ing.ingredient?.nom}</span>
                  <span className="text-orange-500 text-sm font-semibold">{ing.valeur} {ing.unite}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recette.instructions && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <h2 className="text-base font-bold text-gray-800 mb-3">Instructions</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{recette.instructions}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">Commentaires ({commentCount})</h2>

          <div className="flex gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                className="flex-1 px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-orange-300"
              />
              <button
                onClick={sendComment}
                disabled={sendingComment || !newComment.trim()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          {commentaires.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Aucun commentaire pour l'instant</p>
          ) : (
            <div className="flex flex-col gap-4">
              {commentaires.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
                    {comment.auteur?.prenom?.[0]}{comment.auteur?.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{comment.auteur?.prenom} {comment.auteur?.nom}</p>
                      {comment.auteur?.id === user.id && (
                        <button onClick={() => deleteComment(comment.id)}>
                          <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{comment.contenu}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  )
}