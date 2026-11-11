export const inputCls =
  'w-full h-11 px-4 rounded-xl bg-vx-surface border border-vx-line text-sm text-white placeholder:text-slate-500 outline-none focus:border-vx-accent-text/60 transition-colors'

export default function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[13px] font-medium text-slate-300">{label}</span>
      {children}
      {error && <span className="block mt-1 text-[12px] text-rose-400">{error}</span>}
    </label>
  )
}
