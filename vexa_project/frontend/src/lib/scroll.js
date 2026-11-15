export const idOf = (hash) => hash.replace(/^#/, '')

// Smooth-scroll to an in-page section. Falls back to the browser's default anchor jump
// if the target element does not exist.
export function scrollToHash(event, hash, after) {
  const el = document.getElementById(idOf(hash))
  if (!el) return
  event.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  window.history.replaceState(null, '', hash)
  if (after) after()
}

export const external = { target: '_blank', rel: 'noopener noreferrer' }
