import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import Button from './Button.jsx'
import { inputCls } from './Field.jsx'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../lib/api.js'

// Only a customer whose order for this product was delivered can review it (the server checks this too).
export default function ReviewForm({ product, onDone }) {
  const { user, openAuth } = useApp()
  const [state, setState] = useState({ loading: true, eligible: false, existing: null })
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')

  useEffect(() => {
    if (!user) {
      setState({ loading: false, eligible: false, existing: null })
      return undefined
    }
    let alive = true
    api
      .myReviews()
      .then((d) => {
        if (!alive) return
        const existing = (d.reviews || []).find((r) => r.productSlug === product.slug) || null
        setState({ loading: false, eligible: (d.eligible || []).some((x) => x.slug === product.slug), existing })
        if (existing) {
          setRating(existing.rating)
          setText(existing.text)
        }
      })
      .catch(() => alive && setState({ loading: false, eligible: false, existing: null }))
    return () => {
      alive = false
    }
  }, [user, product.slug])

  const box = 'mt-6 p-5 rounded-xl bg-vx-surface border border-vx-line'
  if (state.loading) return null
  if (!user) {
    return (
      <div className={`${box} flex flex-wrap items-center justify-between gap-4`}>
        <p className="text-[14px] text-vx-muted">Değerlendirme yazmak için giriş yapın. Yalnızca bu ürünü satın alan müşteriler yorum yazabilir.</p>
        <Button size="sm" variant="secondary" onClick={() => openAuth('login')}>Giriş yap</Button>
      </div>
    )
  }
  if (!state.eligible) return <div className={box}><p className="text-[14px] text-vx-muted">Bu ürünü yalnızca satın alıp teslim alan müşteriler değerlendirebilir.</p></div>

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!rating) return setError('Lütfen yıldız vererek puanlayın.')
    if (text.trim().length < 10) return setError('Yorumunuz en az 10 karakter olmalıdır.')
    setBusy(true)
    try {
      const d = await api.postReview({ productSlug: product.slug, rating, text })
      setSent(d.message)
      onDone && onDone()
    } catch (err) {
      setError((err.errors && (err.errors.text || err.errors.rating)) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={`${box} space-y-4`}>
      <h3 className="text-[16px] font-semibold text-white">{state.existing ? 'Değerlendirmenizi düzenleyin' : 'Bu ürünü değerlendirin'}</h3>
      {state.existing && <p className="text-[12px] text-vx-muted">Durum: {state.existing.status === 'approved' ? 'yayında' : state.existing.status === 'pending' ? 'onay bekliyor' : 'yayınlanmadı'}. Düzenlerseniz yeniden onaya gider.</p>}
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} yıldız`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
            <Star className={`w-7 h-7 transition-colors ${n <= (hover || rating) ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-zinc-500'}`} />
          </button>
        ))}
      </div>
      <textarea className={`${inputCls} h-28 py-3 resize-none`} value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="Yorumunuz (en az 10 karakter)" />
      {error && <p role="alert" className="text-[13px] text-rose-400">{error}</p>}
      {sent && <p className="text-[13px] text-emerald-400">{sent}</p>}
      <Button type="submit" size="sm" disabled={busy}>{busy ? 'Gönderiliyor…' : state.existing ? 'Güncelle' : 'Gönder'}</Button>
    </form>
  )
}
