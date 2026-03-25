import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname

  const isActive = (path) => current === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-3 z-50">

      <button onClick={() => navigate('/main')} className="flex flex-col items-center gap-1">
        <svg width="24" height="24" fill="none" stroke={isActive('/main') ? '#F25C05' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className={`text-xs font-medium ${isActive('/main') ? 'text-orange-500' : 'text-gray-400'}`}>Feed</span>
      </button>

      <button onClick={() => navigate('/live')} className="flex flex-col items-center gap-1">
        <svg width="24" height="24" fill="none" stroke={isActive('/live') ? '#F25C05' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M9 10l6 2-6 2V10z" fill={isActive('/live') ? '#F25C05' : '#9CA3AF'} />
        </svg>
        <span className={`text-xs font-medium ${isActive('/live') ? 'text-orange-500' : 'text-gray-400'}`}>Live</span>
      </button>

      <button
        onClick={() => navigate('/create')}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-6"
        style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button onClick={() => navigate('/explore')} className="flex flex-col items-center gap-1">
        <svg width="24" height="24" fill="none" stroke={isActive('/explore') ? '#F25C05' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className={`text-xs font-medium ${isActive('/explore') ? 'text-orange-500' : 'text-gray-400'}`}>Explore</span>
      </button>

      <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1">
        <svg width="24" height="24" fill="none" stroke={isActive('/profile') ? '#F25C05' : '#9CA3AF'} strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className={`text-xs font-medium ${isActive('/profile') ? 'text-orange-500' : 'text-gray-400'}`}>Account</span>
      </button>

    </div>
  )
}