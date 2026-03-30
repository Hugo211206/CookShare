import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const typeIcon = (type) => {
  switch (type) {
    case 'LIKE': return { emoji: '❤️', bg: 'bg-pink-50', border: 'border-pink-100' }
    case 'COMMENTAIRE': return { emoji: '💬', bg: 'bg-blue-50', border: 'border-blue-100' }
    case 'FOLLOW': return { emoji: '👤', bg: 'bg-orange-50', border: 'border-orange-100' }
    default: return { emoji: '🔔', bg: 'bg-gray-50', border: 'border-gray-100' }
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    api.get(`/notifications?userId=${user.id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

    // Marquer toutes comme lues à l'ouverture
    api.put(`/notifications/tout-lire?userId=${user.id}`).catch(() => {})
  }, [user.id])

  const handleClick = async (notif) => {
    // Marquer comme lue
    if (!notif.lu) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, lu: true } : n))
      api.put(`/notifications/${notif.id}/lu`).catch(() => {})
    }

    // Naviguer selon le type
    if (notif.type === 'FOLLOW') {
      navigate(`/profil/${notif.lienId}`)
    } else {
      navigate(`/recette/${notif.lienId}`)
    }
  }

  const handleDelete = async (e, notifId) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== notifId))
    api.delete(`/notifications/${notifId}`).catch(() => {})
  }

  const nonLues = notifications.filter(n => !n.lu).length

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            {nonLues > 0 && (
              <p className="text-xs text-orange-500 font-medium">{nonLues} non lue{nonLues > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
              api.put(`/notifications/tout-lire?userId=${user.id}`).catch(() => {})
            }}
            className="text-xs text-orange-500 font-semibold">
            Tout lire
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="px-5 mt-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-gray-500">Aucune notification</p>
            <p className="text-sm mt-1">Tes notifications apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const { emoji, bg, border } = typeIcon(notif.type)
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    notif.lu ? `bg-white ${border}` : `${bg} ${border} border`
                  }`}>

                  {/* Avatar déclencheur */}
                  <div className="relative flex-shrink-0">
                    {notif.declencheur?.photoProfilUrl ? (
                      <img
                        src={notif.declencheur.photoProfilUrl}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
                        {notif.declencheur?.prenom?.[0]}{notif.declencheur?.nom?.[0]}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-sm">{emoji}</span>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.lu ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.dateCreation)}</p>
                  </div>

                  {/* Point non lu + suppression */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.lu && (
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all">
                      <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}