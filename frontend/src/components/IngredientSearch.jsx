import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'

export default function IngredientSearch({ index, ingredient, onUpdate, onRemove, showRemove }) {
  const [query, setQuery] = useState(ingredient.nom || '')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [creating, setCreating] = useState(false)
  const searchTimeout = useRef(null)

  const handleSearch = (value) => {
    setQuery(value)
    onUpdate(index, 'nom', value)
    onUpdate(index, 'ingredientId', null)

    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (value.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/ingredient/search?nom=${value}`)
        setResults(res.data)
        setShowDropdown(true)
      } catch {
        setResults([])
      }
    }, 300)
  }

  const selectIngredient = (ing) => {
    setQuery(ing.nom)
    onUpdate(index, 'nom', ing.nom)
    onUpdate(index, 'ingredientId', ing.id)
    setShowDropdown(false)
    setResults([])
  }

  const createIngredient = async () => {
    if (!query.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/ingredient', { nom: query.trim() })
      selectIngredient(res.data)
    } catch {
      console.error('Erreur création ingrédient')
    } finally {
      setCreating(false)
    }
  }

  const exactMatch = results.some(r => r.nom.toLowerCase() === query.toLowerCase())

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">Ingrédient {index + 1}</span>
        {showRemove && (
          <button onClick={() => onRemove(index)} className="text-red-400">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-300">
          <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un ingrédient..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="bg-transparent text-sm text-gray-800 outline-none flex-1 placeholder-gray-400"
          />
          {ingredient.ingredientId && (
            <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 mt-1 z-50 overflow-hidden">
            {results.map(ing => (
              <button
                key={ing.id}
                onClick={() => selectIngredient(ing)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                {ing.nom}
              </button>
            ))}

            {!exactMatch && query.trim().length >= 2 && (
              <button
                onClick={createIngredient}
                disabled={creating}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-orange-500 hover:bg-orange-50 flex items-center gap-2 border-t border-gray-100 transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {creating ? 'Création...' : `Créer "${query.trim()}"`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Quantité"
          value={ingredient.valeur}
          onChange={e => onUpdate(index, 'valeur', e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-orange-300"
        />
        <input
          type="text"
          placeholder="Unité (g, ml...)"
          value={ingredient.unite}
          onChange={e => onUpdate(index, 'unite', e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-orange-300"
        />
      </div>
    </div>
  )
}