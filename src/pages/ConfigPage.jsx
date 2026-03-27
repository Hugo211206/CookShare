import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function ConfigPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const called = useRef(false)

  const [form, setForm] = useState({ pseudo: '', bio: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  const [mdp, setMdp] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [savingMdp, setSavingMdp] = useState(false)
  const [successMdp, setSuccessMdp] = useState('')
  const [errorMdp, setErrorMdp] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    api.get(`/utilisateurs/${user.id}`)
      .then(res => {
        setProfil(res.data)
        setForm({
          pseudo: res.data.pseudo ?? '',
          bio: res.data.bio ?? '',
          email: res.data.email ?? '',
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post(`/media/utilisateur/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfil(p => ({ ...p, photoProfilUrl: res.data.url }))
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveInfos = async () => {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      await api.put(`/utilisateurs/${user.id}`, {
        pseudo: form.pseudo,
        bio: form.bio,
        email: form.email,
      })
      setSuccessMsg('Profil mis à jour !')
    } catch (err) {
      setErrorMsg('Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMdp = async () => {
    setSuccessMdp('')
    setErrorMdp('')

    if (mdp.nouveau !== mdp.confirmation) {
      setErrorMdp('Les mots de passe ne correspondent pas.')
      return
    }
    if (mdp.nouveau.length < 6) {
      setErrorMdp('Le mot de passe doit faire au moins 6 caractères.')
      return
    }

    setSavingMdp(true)
    try {
      await api.put(`/utilisateurs/${user.id}/password`, {
        ancienMotDePasse: mdp.ancien,
        nouveauMotDePasse: mdp.nouveau,
      })
      setSuccessMdp('Mot de passe mis à jour !')
      setMdp({ ancien: '', nouveau: '', confirmation: '' })
    } catch (err) {
      setErrorMdp('Ancien mot de passe incorrect.')
    } finally {
      setSavingMdp(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      await api.delete(`/utilisateurs/${user.id}`)
      logout()
      navigate('/auth')
    } catch (err) {
      console.error(err)
      setDeletingAccount(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate('/profile')}>
          <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Avatar cliquable */}
      <div className="flex flex-col items-center mt-6 gap-2">
        <button onClick={() => fileInputRef.current.click()} className="relative">
          {avatarPreview || profil?.photoProfilUrl ? (
            <img
              src={avatarPreview ?? profil.photoProfilUrl}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              {profil?.prenom?.[0]}{profil?.nom?.[0]}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center">
            <svg width="12" height="12" fill="none" stroke="#F25C05" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
        </button>

        {uploadingAvatar && <p className="text-xs text-orange-500">Upload en cours...</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Section infos personnelles */}
      <div className="px-5 mt-6 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-4">Infos personnelles</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pseudo</label>
              <input
                type="text"
                value={form.pseudo}
                onChange={e => setForm(f => ({ ...f, pseudo: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {successMsg && <p className="text-green-500 text-sm mt-3">{successMsg}</p>}
          {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}

          <button
            onClick={handleSaveInfos}
            disabled={saving}
            className="w-full mt-4 py-3 rounded-2xl text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Section mot de passe */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-4">Mot de passe</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ancien mot de passe</label>
              <input
                type="password"
                value={mdp.ancien}
                onChange={e => setMdp(m => ({ ...m, ancien: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nouveau mot de passe</label>
              <input
                type="password"
                value={mdp.nouveau}
                onChange={e => setMdp(m => ({ ...m, nouveau: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmation</label>
              <input
                type="password"
                value={mdp.confirmation}
                onChange={e => setMdp(m => ({ ...m, confirmation: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {successMdp && <p className="text-green-500 text-sm mt-3">{successMdp}</p>}
          {errorMdp && <p className="text-red-500 text-sm mt-3">{errorMdp}</p>}

          <button
            onClick={handleSaveMdp}
            disabled={savingMdp}
            className="w-full mt-4 py-3 rounded-2xl text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
            {savingMdp ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="px-5 mt-4 mb-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-red-100">
          <h2 className="text-base font-bold text-red-500 mb-1">Supprimer mon compte</h2>
          <p className="text-xs text-gray-400 mb-4">Cette action est irréversible. Toutes vos données seront supprimées.</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3 rounded-2xl text-red-500 font-semibold text-sm border border-red-300 hover:bg-red-50 transition-colors">
            Supprimer
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est <span className="font-semibold text-red-500">définitive</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm">
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm disabled:opacity-50">
                {deletingAccount ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  )
}
