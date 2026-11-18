// Resizes an image in the browser and returns base64 (no data: prefix). WebP when supported, JPEG otherwise.
export async function shrinkImage(file, max = 1600, limit = 1300000) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(bmp.width * scale))
  c.height = Math.max(1, Math.round(bmp.height * scale))
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  const toBlob = (type, q) => new Promise((r) => c.toBlob(r, type, q))
  const probe = await toBlob('image/webp', 0.8)
  const type = probe && probe.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
  let blob = null
  for (const q of [0.86, 0.74, 0.62, 0.5, 0.4]) {
    blob = await toBlob(type, q)
    if (blob && blob.size < limit) break
  }
  if (!blob) throw new Error('Görsel işlenemedi.')
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1])
    fr.onerror = () => reject(new Error('Dosya okunamadı.'))
    fr.readAsDataURL(blob)
  })
}
