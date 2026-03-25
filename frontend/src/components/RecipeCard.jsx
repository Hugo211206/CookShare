export default function RecipeCard({ recette, onClick, onToggleFavori }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">

      <div className="relative h-36 bg-gray-200">
        {recette.medias?.[0]?.url ? (
          <img src={recette.medias[0].url} alt={recette.titre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {recette.difficulte && (
            <div className="flex items-center gap-1 bg-black bg-opacity-50 rounded-full px-2 py-0.5">
              <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <span className="text-white text-xs">{recette.difficulte}</span>
            </div>
          )}
        </div>
      </div>


      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1.5 line-clamp-2">{recette.titre}</h3>
        {recette.auteur && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)' }}>
              {recette.auteur.prenom?.[0]}{recette.auteur.nom?.[0]}
            </div>
            <span className="text-xs text-gray-400">{recette.auteur.pseudo}</span>
          </div>
        )}
      </div>
    </div>
  )
}