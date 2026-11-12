import { useEffect, useState } from 'react'
import { Star, BadgeCheck } from 'lucide-react'
import Button from './Button.jsx'
import { inputCls } from './Field.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useReviews } from '../hooks/useLive.js'
import useProducts from '../hooks/useProducts.js'
import { api } from '../lib/api.js'
import { dateLabel } from '../lib/format.js'

const Stars = ({ value, className = 'w-4 h-4' }) => (
  <div className="flex gap-0.5" aria-label={`${value} yıldız`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`${className} ${i < Math.round(value) ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-vx-line'}`} />
    ))}
  </div>
)

function ReviewForm({ onDone }) {
  const { user, openAuth } = useApp()
  const products = useProducts()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [product, setProduct] = useState('')
  const [mine, setMine] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')

  useEffect(() => {
    if (!user) return
    api
      .myReview()
      .then((d) => {
        if (d.review) {
          setMine(d.review)
          setRating(d.review.rating)
          setText(d.review.text)
          setProduct(d.review.product || '')
        }
      })
      .catch(() => {})
  }, [user])

  if (!user) {
    return (
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-vx-surface border border-vx-line">
        <p className="text-[14px] text-vx-muted">Yorum yazabilmek için giriş yapmanız gerekir. Yorumlar yalnızca gerçek müşterilerimizden gelir.</p>
        <Button size="sm" onClick={() => openAuth('login')}>
          Giriş yap ve yorum yaz
        </Button>
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!rating) return setError('Lütfen yıldız vererek puanlayın.')
    if (text.trim().length < 10) return setError('Yorumunuz en az 10 karakter olmalıdır.')
    setBusy(true)
    try {
      const d = await api.postReview({ rating, text, product })
      setSent(d.message)
      onDone && onDone()
    } catch (err) {
      setError((err.errors && (err.errors.text || err.errors.rating)) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 p-6 rounded-2xl bg-vx-surface border border-vx-line space-y-4">
      <h3 className="text-[16px] font-semibold text-white">{mine ? 'Yorumunuzu düzenleyin' : 'Deneyiminizi paylaşın'}</h3>
      {mine && (
        <p className="text-[12px] text-vx-muted">
          Mevcut yorumunuzun durumu: {mine.status === 'approved' ? 'yayında' : mine.status === 'pending' ? 'onay bekliyor' : 'yayınlanmadı'}. Düzenlerseniz yeniden onaya gönderilir.
        </p>
      )}
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} yıldız`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
            <Star className={`w-7 h-7 transition-colors ${n <= (hover || rating) ? 'fill-vx-accent-soft text-vx-accent-soft' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>
      <select className={inputCls} value={product} onChange={(e) => setProduct(e.target.value)} aria-label="Hizmet">
        <option value="">Hangi hizmeti aldınız? (isteğe bağlı)</option>
        {products.map((p) => (
          <option key={p.slug} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      <textarea className={`${inputCls} h-28 py-3 resize-none`} value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="Yorumunuz (en az 10 karakter)" />
      {error && (
        <p role="alert" className="text-[13px] text-rose-400">
          {error}
        </p>
      )}
      {sent && <p className="text-[13px] text-emerald-400">{sent}</p>}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? 'Gönderiliyor…' : mine ? 'Yorumu Güncelle' : 'Yorumu Gönder'}
      </Button>
    </form>
  )
}

export default function Reviews() {
  const { loading, reviews, stats, reload } = useReviews()

  return (
    <section id="yorumlar">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Müşteri Yorumları</h2>
        {stats && stats.count > 0 && (
          <div className="flex items-center gap-3 text-[13px] text-vx-muted">
            <Stars value={stats.average} />
            <span>
              <strong className="text-white">{stats.average}</strong> / 5 · <strong className="text-white">%{stats.satisfaction}</strong> memnuniyet · {stats.count} yorum
            </span>
          </div>
        )}
      </div>

      {!loading && reviews.length === 0 && (
        <div className="mt-5 p-6 rounded-2xl bg-vx-card border border-vx-line text-[14px] text-vx-muted">Henüz yayınlanmış yorum yok. İlk yorumu siz yazın.</div>
      )}

      {reviews.length > 0 && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(0, 9).map((r) => (
            <figure key={`${r.name}${r.createdAt}`} className="flex flex-col p-6 rounded-2xl bg-vx-card border border-vx-line">
              <Stars value={r.rating} />
              <blockquote className="mt-4 text-[14px] leading-relaxed text-slate-200 break-words">“{r.text}”</blockquote>
              <figcaption className="mt-auto pt-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-white">{r.name}</div>
                  <div className="text-[12px] text-vx-muted">
                    {r.product ? `${r.product} · ` : ''}
                    {dateLabel(r.createdAt)}
                  </div>
                </div>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-vx-accent-soft">
                    <BadgeCheck className="w-4 h-4" /> Doğrulanmış müşteri
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <ReviewForm onDone={reload} />
    </section>
  )
}
