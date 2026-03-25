import { useState, useEffect  } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import IngredientSearch from '../components/IngredientSearch'

const DIFFICULTE = ['FACILE', 'MOYEN', 'DIFFICILE']
const TYPE_PLAT = ['ENTREE', 'PLAT', 'DESSERT', 'SNACK']

export default function CreateRecipePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [photoFiles, setPhotoFiles] = useState([])
  const [cuisines, setCuisines] = useState([])

  useEffect(() => {
    api.get('/cuisines').then(res => setCuisines(res.data))
    }, [])

  const [form, setForm] = useState({
    titre: '',
    description: '',
    instructions: '',
    difficulte: 'FACILE',
    typePlat: 'PLAT',
    cuisineId: '',
    ingredients: [{ nom: '', valeur: '', unite: '', ingredientId: null }]
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhoto = (e) => {
  const newFiles = Array.from(e.target.files)
  setPhotoFiles(prev => {
    const combined = [...prev, ...newFiles].slice(0, 5)
    setPhotoPreviews(combined.map(f => URL.createObjectURL(f)))
    return combined
  })
}

  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { nom: '', valeur: '', unite: '' }]
    }))
  }

  const removeIngredient = (index) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index, field, value) => {
  setForm(prev => ({
    ...prev,
    ingredients: prev.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    )
  }))
}

  const handleSubmit = async () => {
    setError('')
    if (!form.titre.trim()) { setError('Le titre est obligatoire'); return }

    setLoading(true)
    try {
        console.log(user)
      const recetteData = {
        titre: form.titre,
        description: form.description,
        instructions: form.instructions,
        difficulte: form.difficulte,
        typePlat: form.typePlat,
        auteurId: user.id,
        cuisineId: form.cuisineId ? parseInt(form.cuisineId) : null,
        ingredients: form.ingredients
            .filter(ing => ing.ingredientId)
            .map(ing => ({
             ingredientId: ing.ingredientId,
             valeur: parseFloat(ing.valeur) || 0,
             unite: ing.unite
            }))
        }

      const res = await api.post('/recettes', recetteData)
      const recetteId = res.data.id

      if (photoFiles && recetteId) {
        for (const file of photoFiles) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/media/recette/${recetteId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
    }

      navigate('/main')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => step === 1 ? navigate('/main') : setStep(s => s - 1)}
          className="text-gray-500">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Create Recipe</h1>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="px-5 py-2 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-2xl text-white font-semibold text-sm disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #F25C05, #F29B30)' }}>
            {loading ? '...' : 'Publier'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 py-5">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s === step ? 'text-white shadow-md' : s < step ? 'text-white' : 'bg-gray-200 text-gray-400'}`}
              style={s <= step ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-orange-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="px-5 pb-10">

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Recipe Photo</label>
              <label className="block cursor-pointer">
                <input type="file" accept="image/*,video/*" multiple onChange={handlePhoto} className="hidden" />
                <div className={`min-h-70 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${photoPreviews.length > 0 ? 'border-orange-300 p-2' : 'border-gray-300 bg-gray-100'}`}>
  {photoPreviews.length > 0 ? (
    <div className="grid grid-cols-5 gap-2 w-full">
      {photoPreviews.map((preview, i) => (
        <div key={i} className="relative h-48 rounded-xl overflow-hidden">
          <img src={preview} className="w-full h-full object-cover" />
          <button
                onClick={() => {
                        setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i))
                        setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))
                    }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                        </div>
                    ))}
                    {photoPreviews.length < 5 && (
                        <label className="h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer">
                        <input type="file" accept="image/*,video/*" multiple onChange={handlePhoto} className="hidden" />
                        <svg width="24" height="24" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        </label>
                    )}
                    </div>
                    ) : (
                    <>
                    <svg width="40" height="40" fill="none" stroke="#9CA3AF" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Ajouter jusqu'à 5 photos</p>
                    <p className="text-gray-400 text-xs">ou une vidéo</p>
                    </>
                )}
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Recipe Title</label>
              <input
                type="text"
                placeholder="e.g., Chocolate Chip Cookies"
                value={form.titre}
                onChange={e => update('titre', e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <textarea
                placeholder="Describe your recipe..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-300 resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
            <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-gray-700">Ingrédients</h2>
                {form.ingredients.map((ing, index) => (
                    <IngredientSearch
                    key={index}
                    index={index}
                    ingredient={ing}
                    onUpdate={updateIngredient}
                    onRemove={removeIngredient}
                    showRemove={form.ingredients.length > 1}/>
                ))}
                <button onClick={addIngredient} className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-orange-300 text-orange-500 font-semibold text-sm">
                + Ajouter un ingrédient
            </button>
            </div>
        )}

        {/* Step 3 - Instructions & détails */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Instructions</label>
              <textarea
                placeholder="Décrivez les étapes de préparation..."
                value={form.instructions}
                onChange={e => update('instructions', e.target.value)}
                rows={6}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-300 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Difficulté</label>
              <div className="flex gap-3">
                {DIFFICULTE.map(d => (
                  <button
                    key={d}
                    onClick={() => update('difficulte', d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.difficulte === d ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-500'}`}
                    style={form.difficulte === d ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Type de plat</label>
              <div className="grid grid-cols-2 gap-3">
                {TYPE_PLAT.map(t => (
                  <button
                    key={t}
                    onClick={() => update('typePlat', t)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.typePlat === t ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-500'}`}
                    style={form.typePlat === t ? { background: 'linear-gradient(135deg, #F25C05, #F29B30)' } : {}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">Cuisine</label>
                    <select value={form.cuisineId} onChange={e => update('cuisineId', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-300">
                    <option value="">Sélectionner une cuisine</option>
                    {cuisines.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
                </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}