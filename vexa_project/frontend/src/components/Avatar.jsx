import { useState } from 'react'

// Profile picture (Google / Discord) or, for e-mail sign-ups, a circle with the first letter of the name.
export default function Avatar({ user, className = 'w-11 h-11 text-[16px]' }) {
  const [bad, setBad] = useState(false)
  const letter = (Array.from((user && user.name ? user.name : '?').trim())[0] || '?').toLocaleUpperCase('tr-TR')
  if (user && user.avatar && !bad) {
    return <img src={user.avatar} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} className={`${className} rounded-full object-cover bg-vx-surface`} />
  }
  return (
    <span aria-hidden="true" className={`${className} rounded-full grid place-items-center font-bold text-white bg-gradient-to-br from-vx-accent to-purple-600 select-none`}>
      {letter}
    </span>
  )
}
