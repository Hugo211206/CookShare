import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import AgoraRTC from 'agora-rtc-sdk-ng'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID

export default function LivePage() {
  const { user } = useAuth()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('liste')
  const [sessionActive, setSessionActive] = useState(null)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    api.get('/sessions')
      .then(res => setSessions(res.data.filter(s => s.statut !== 'TERMINEE')))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // WebSocket pour les mises à jour en temps réel des sessions
  useEffect(() => {
    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        client.subscribe('/topic/sessions', (frame) => {
          const event = JSON.parse(frame.body)
          if (event.statut === 'TERMINEE') {
            setSessions(prev => prev.filter(s => s.id !== event.id))
          } else {
            setSessions(prev => prev.map(s => s.id === event.id ? { ...s, statut: event.statut } : s))
          }
        })
      },
    })
    client.activate()
    return () => client.deactivate()
  }, [])

  const rejoindreSession = async (session) => {
    const isHote = session.hote?.id === user?.id || session.hoteId === user?.id
    if (isHote && session.statut === 'EN_ATTENTE') {
      try {
        const res = await api.put(`/sessions/${session.id}/start`)
        setSessions(prev => prev.map(s => s.id === session.id ? res.data : s))
        setSessionActive(res.data)
      } catch (err) {
        console.error(err)
        setSessionActive(session)
      }
    } else {
      setSessionActive(session)
    }
    setView('salon')
  }

  const quitterSession = () => {
    setSessionActive(null)
    setView('liste')
  }

  const terminerSession = async () => {
    try {
      await api.put(`/sessions/${sessionActive.id}/end`)
      setSessions(prev => prev.filter(s => s.id !== sessionActive.id))
    } catch (err) {
      console.error(err)
    }
    setSessionActive(null)
    setView('liste')
  }

  const isHoteActif = sessionActive?.hote?.id === user?.id || sessionActive?.hoteId === user?.id

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {view === 'liste' ? 'Live Cooking' : sessionActive?.titre}
        </h1>
        {view === 'salon' && (
          <button
            onClick={isHoteActif ? terminerSession : quitterSession}
            className={`text-sm font-semibold ${isHoteActif ? 'text-red-500' : 'text-gray-500'}`}>
            {isHoteActif ? 'Terminer' : 'Quitter'}
          </button>
        )}
      </div>

      {view === 'liste'
        ? <VueListe
            sessions={sessions}
            setSessions={setSessions}
            user={user}
            onRejoindre={rejoindreSession}
          />
        : <VueSalon
            session={sessionActive}
            user={user}
            isHote={isHoteActif}
          />
      }

      {view === 'liste' && <Navbar />}
    </div>
  )
}

// Composants définis plus bas — on les remplit aux étapes suivantes
function VueListe({ sessions, setSessions, user, onRejoindre }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ titre: ''})
  const [creating, setCreating] = useState(false)


  const handleCreate = async () => {
    if (!form.titre) return
    setCreating(true)
    try {
      const res = await api.post('/sessions', {
        hoteId: user.id,
        titre: form.titre,
      })
      setSessions(s => [res.data, ...s])
      setShowModal(false)
      setForm({ titre: ''})
      onRejoindre(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const enCours = sessions.filter(s => s.statut === 'EN_COURS')
  const aVenir = sessions.filter(s => s.statut !== 'EN_COURS')

  const terminerDepuisListe = async (session) => {
    try {
      await api.put(`/sessions/${session.id}/end`)
      setSessions(prev => prev.filter(s => s.id !== session.id))
    } catch (err) {
      console.error(err)
    }
  }

  const SessionCard = ({ session }) => {
    const isHote = session.hote?.id === user?.id || session.hoteId === user?.id
    const enCours = session.statut === 'EN_COURS'
    const [ending, setEnding] = useState(false)

    const handleTerminer = async (e) => {
      e.stopPropagation()
      setEnding(true)
      await terminerDepuisListe(session)
    }

    return (
      <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0">
          {session.recette?.medias?.[0]?.url ? (
            <img src={session.recette.medias[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{session.titre}</p>
          <p className="text-xs text-gray-400 mt-0.5">par @{session.hote?.pseudo}</p>
          {enCours ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-500">En cours</span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-orange-500 mt-1 inline-block">À venir</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          {/* Bouton principal */}
          {isHote && !enCours ? (
            <button
              onClick={() => onRejoindre(session)}
              className="px-4 py-2 rounded-2xl text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              ▶ Démarrer
            </button>
          ) : (
            <button
              onClick={() => onRejoindre(session)}
              className="px-4 py-2 rounded-2xl text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              {enCours ? 'Rejoindre' : 'Voir'}
            </button>
          )}

          {/* Bouton Terminer visible uniquement pour l'hôte d'un live EN COURS */}
          {isHote && enCours && (
            <button
              onClick={handleTerminer}
              disabled={ending}
              className="px-4 py-2 rounded-2xl text-red-500 border border-red-200 bg-red-50 text-xs font-semibold disabled:opacity-50 hover:bg-red-100 transition-colors">
              {ending ? '…' : 'Terminer'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 mt-6">

      {/* Bouton lancer un live */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 rounded-2xl text-white font-semibold text-sm mb-6 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Lancer un live
      </button>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍳</p>
          <p className="font-semibold">Aucune session active</p>
          <p className="text-sm mt-1">Sois le premier à lancer un live !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enCours.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">En cours</p>
              <div className="space-y-3">
                {enCours.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </div>
          )}
          {aVenir.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">À venir</p>
              <div className="space-y-3">
                {aVenir.map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 py-20 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Lancer un live</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre du live</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  placeholder=""
                  className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.titre}
                className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
                {creating ? 'Création...' : 'Lancer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VueSalon({ session, user, isHote }) {
  const [messages, setMessages] = useState([])
  const [texte, setTexte] = useState('')
  const [chatVisible, setChatVisible] = useState(true)
  const stompClient = useRef(null)
  const messagesEndRef = useRef(null)
  const agoraClient = useRef(null)
  const localVideoTrack = useRef(null)
  const localAudioTrack = useRef(null)
  const videoContainerRef = useRef(null)

  // WebSocket chat
  useEffect(() => {
    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        client.subscribe(`/topic/chat/${session.id}`, (frame) => {
          const msg = JSON.parse(frame.body)
          setMessages(prev => [...prev, msg])
        })
      },
    })
    client.activate()
    stompClient.current = client
    return () => client.deactivate()
  }, [session.id])

  // Agora video
  useEffect(() => {
    const channelName = String(session.roomId || session.id)

    const init = async () => {
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
      agoraClient.current = client

      await client.setClientRole(isHote ? 'host' : 'audience')
      await client.join(AGORA_APP_ID, channelName, null, user.id)

      if (isHote) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        const videoTrack = await AgoraRTC.createCameraVideoTrack()
        localAudioTrack.current = audioTrack
        localVideoTrack.current = videoTrack
        videoTrack.play('agora-local-video', { fit: 'contain' })
        await client.publish([audioTrack, videoTrack])
      } else {
        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType)
          if (mediaType === 'video') remoteUser.videoTrack.play('agora-remote-video', { fit: 'contain' })
          if (mediaType === 'audio') remoteUser.audioTrack.play()
        })
      }
    }

    init().catch(console.error)

    return () => {
      localVideoTrack.current?.close()
      localAudioTrack.current?.close()
      agoraClient.current?.leave()
    }
  }, [session.id, session.roomId, isHote, user.id])

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const envoyerMessage = () => {
    if (!texte.trim() || !stompClient.current?.connected) return
    stompClient.current.publish({
      destination: `/app/chat/${session.id}`,
      body: JSON.stringify({
        pseudo: user.pseudo,
        contenu: texte.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }),
    })
    setTexte('')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="flex flex-col bg-black" style={{ height: 'calc(100vh - 73px)' }}>

      {/* Zone vidéo — plein écran si chat masqué */}
      <div
        ref={videoContainerRef}
        className="relative bg-black transition-all duration-300"
        style={{ height: chatVisible ? '45%' : '100%' }}
      >
        {isHote
          ? <div id="agora-local-video" className="w-full h-full" />
          : <div id="agora-remote-video" className="w-full h-full" />
        }

        {/* Badge LIVE */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
        </div>

        {/* Boutons en haut à droite */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Toggle chat */}
          <button
            onClick={() => setChatVisible(v => !v)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            {chatVisible ? (
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="white" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>
          {/* Plein écran */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {/* Pseudo hôte pour les viewers */}
        {!isHote && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-xs font-semibold">@{session.hote?.pseudo}</span>
          </div>
        )}
      </div>

      {/* Chat — masquable */}
      {chatVisible && (
        <div className="flex flex-col flex-1 bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-4">Soyez le premier à écrire !</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.pseudo === user.pseudo
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <p className="text-xs text-gray-400 mb-0.5 ml-1">@{msg.pseudo}</p>}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] ${isMe ? 'text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}
                    style={isMe ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {msg.contenu}
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 mx-1">{msg.timestamp}</p>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
            <input
              type="text"
              value={texte}
              onChange={e => setTexte(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
              placeholder="Écrire un message..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={envoyerMessage}
              disabled={!texte.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}