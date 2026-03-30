import { useEffect, useState} from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const navigate = useNavigate()


  useEffect(() => {
  if (called.current) return
  called.current = true

  const token = searchParams.get('token')
  if (!token) { setStatus('error'); return }

  api.get(`/auth/verify?token=${token}`)
    .then(() => setStatus('success'))
    .catch(() => setStatus('error'))
}, [])  

  return (
    <div>

        <div className="absolute top-0 left-0 w-72 h-72 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', opacity: 0.18 }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3"
          style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)', opacity: 0.18 }} />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md w-full">

        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
            <p className="text-gray-500 font-medium">Vérification en cours...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Email vérifié !</h2>
            <button
              onClick={() => navigate('/auth')}
              className="py-3 px-8 rounded-2xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              Se connecter maintenant
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lien invalide</h2>
            <p className="text-gray-400 mb-6">Ce lien est expiré ou invalide.</p>
            <button
              onClick={() => navigate('/auth')}
              className="py-3 px-8 rounded-2xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
              Retour à la connexion
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}