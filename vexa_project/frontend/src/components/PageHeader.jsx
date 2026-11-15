export default function PageHeader({ title, description }) {
  return (
    <div className="pt-2">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-vx-muted">{description}</p>}
    </div>
  )
}
