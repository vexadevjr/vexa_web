// Order-form fields an admin can switch on per product (mirrors backend/utils/orderFields.js).
export const ORDER_FIELD_PRESETS = {
  discordUsername: { label: 'Discord Kullanıcı Adı', placeholder: 'kullanıcı adınız', hint: '', type: 'text', regex: /^.{2,40}$/, error: 'Discord kullanıcı adınızı girin (2-40 karakter).' },
  discordServerId: { label: 'Discord Sunucu ID', placeholder: '123456789012345678', hint: 'Discord → Ayarlar → Gelişmiş → Geliştirici Modu’nu açın, sunucu adına sağ tıklayıp “Sunucu ID’sini Kopyala” seçin.', type: 'text', regex: /^\d{17,20}$/, error: 'Geçerli bir Discord sunucu ID girin (17-20 haneli sayı).' },
  botToken: { label: 'Discord Bot Token', placeholder: 'MTIz...', hint: 'Discord Developer Portal → Uygulamanız → Bot → “Reset Token”.', type: 'secret', regex: /^[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{15,}$/, error: 'Geçerli bir bot token girin.' },
  botName: { label: 'Discord Bot Adı', placeholder: 'Örn: Nova Guard', hint: '', type: 'text', regex: /^.{2,32}$/, error: 'Bot adı 2-32 karakter olmalıdır.' },
  botLogo: { label: 'Discord Bot Logosu', hint: 'Kare bir görsel önerilir (JPG, PNG veya WebP).', type: 'image', error: 'Lütfen bir logo yükleyin.' },
  serverInvite: { label: 'Discord Sunucu Linki', placeholder: 'https://discord.gg/xxxxxxx', hint: 'Süresiz davet bağlantısı oluşturmanız önerilir.', type: 'text', regex: /^https:\/\/(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[A-Za-z0-9-]{2,32}\/?$/, error: 'Geçerli bir davet linki girin (https://discord.gg/...).' },
}
export const PRESET_KEYS = Object.keys(ORDER_FIELD_PRESETS)
export const labelOf = (d) => (ORDER_FIELD_PRESETS[d.key] ? ORDER_FIELD_PRESETS[d.key].label : d.label)

// client-side check (the server validates again)
export function validateOrderFields(defs = [], values = {}) {
  const errors = {}
  for (const d of defs) {
    const v = (values[d.key] || '').trim()
    const p = ORDER_FIELD_PRESETS[d.key]
    if (!v) {
      if (d.required) errors[`f_${d.key}`] = `${labelOf(d)} zorunludur.`
      continue
    }
    if (p && p.regex && !p.regex.test(v)) errors[`f_${d.key}`] = p.error
  }
  return errors
}
