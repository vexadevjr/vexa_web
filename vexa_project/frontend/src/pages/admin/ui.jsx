import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { inputCls } from '../../components/Field.jsx'

export const AdminContext = createContext({ authLost: () => {} })
export const useAdmin = () => useContext(AdminContext)

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-vx-card border border-vx-line ${className}`}>
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-vx-line flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-white">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

const BTN = {
  primary: 'bg-vx-accent hover:bg-vx-accent-hover text-white border-transparent',
  ghost: 'bg-vx-surface hover:bg-vx-line text-white border-vx-line',
  danger: 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border-rose-500/40',
  success: 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/40',
}

export function Btn({ variant = 'primary', className = '', type = 'button', ...rest }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
      {...rest}
    />
  )
}

const Label = ({ label, hint, children }) => (
  <label className="block">
    {label && <span className="block mb-1.5 text-[12px] font-medium text-zinc-200">{label}</span>}
    {children}
    {hint && <span className="block mt-1 text-[11px] text-zinc-400">{hint}</span>}
  </label>
)

export const TextField = ({ label, hint, value, onChange, type = 'text', max = 200, placeholder, list, disabled }) => (
  <Label label={label} hint={hint}>
    <input className={inputCls} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={max} placeholder={placeholder} list={list} disabled={disabled} />
  </Label>
)

export const AreaField = ({ label, hint, value, onChange, rows = 4, max = 2000, placeholder }) => (
  <Label label={label} hint={hint}>
    <textarea className={`${inputCls} h-auto py-3 resize-y`} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={max} placeholder={placeholder} />
  </Label>
)

export const SelectField = ({ label, value, onChange, options, className = '' }) => (
  <Label label={label}>
    <select className={`${inputCls} ${className}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  </Label>
)

export const CheckField = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-[13px] text-zinc-100 cursor-pointer select-none">
    <input type="checkbox" className="w-4 h-4 accent-violet-500" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
)

const TONES = {
  gray: 'bg-vx-surface border-vx-line text-zinc-200',
  blue: 'bg-vx-accent/20 border-vx-accent/40 text-vx-accent-soft',
  green: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300',
  red: 'bg-rose-600/20 border-rose-500/40 text-rose-300',
  amber: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
}
export const Badge = ({ tone = 'gray', children }) => (
  <span className={`inline-flex items-center h-5 px-2 rounded-md border text-[11px] font-medium whitespace-nowrap ${TONES[tone]}`}>{children}</span>
)

export function Pager({ page, total, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-[12px] text-vx-muted">
      <span>
        {total} kayıt · Sayfa {page}/{pages}
      </span>
      <div className="flex gap-2">
        <Btn variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Önceki
        </Btn>
        <Btn variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Sonraki
        </Btn>
      </div>
    </div>
  )
}

export const Empty = ({ children }) => <p className="py-8 text-center text-[13px] text-vx-muted">{children}</p>

// loads data on mount / when deps change; an expired admin session sends the user back to the login form
export function useLoad(fn, deps = []) {
  const { authLost } = useAdmin()
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    return fnRef
      .current()
      .then((data) => setState({ data, error: '', loading: false }))
      .catch((err) => {
        if (err.status === 401) authLost()
        setState((s) => ({ ...s, error: err.message, loading: false }))
      })
  }, [authLost])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    run()
  }, [run, ...deps])
  return { ...state, reload: run }
}

export function useToast() {
  const [msg, setMsg] = useState(null)
  const timer = useRef(null)
  const push = useCallback((text, tone = 'ok') => {
    setMsg({ text, tone })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 3500)
  }, [])
  const node = msg ? (
    <div role="status" className={`fixed bottom-5 right-5 z-[60] px-4 py-3 rounded-xl text-[13px] font-medium border shadow-lg ${msg.tone === 'err' ? 'bg-rose-950 border-rose-500/50 text-rose-200' : 'bg-emerald-950 border-emerald-500/50 text-emerald-200'}`}>
      {msg.text}
    </div>
  ) : null
  return [node, push]
}

// guards a destructive action behind a confirmation
export const confirmDo = (message) => window.confirm(message)
