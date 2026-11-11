import { Link } from 'react-router-dom'
import CtaFx from './CtaFx.jsx'

const base =
  'inline-flex items-center justify-center gap-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'

const variants = {
  // solid indigo with the shared infinite shimmer
  primary:
    'group relative overflow-hidden text-white bg-vx-accent hover:bg-vx-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 active:translate-y-0',
  secondary: 'group text-white border border-vx-accent/40 hover:bg-vx-card hover:border-vx-accent-text/50 hover:-translate-y-0.5',
  quiet: 'group text-white bg-vx-surface border border-vx-line hover:bg-vx-accent hover:border-vx-accent',
  flat: 'group text-white bg-vx-accent hover:bg-vx-accent-hover',
}

const sizes = {
  sm: 'h-10 px-5 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-[52px] px-6 text-[15px]',
}

export default function Button({ variant = 'primary', size = 'md', to, href, external, className = '', children, ...rest }) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  const content = (
    <>
      {variant === 'primary' && <CtaFx />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  )
}
