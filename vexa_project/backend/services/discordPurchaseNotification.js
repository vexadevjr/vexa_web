'use strict'

const config = require('../config/appConfig')
const Order = require('../models/Order')

const DISCORD_API = 'https://discord.com/api/v10'
const CLAIM_TTL_MS = 5 * 60 * 1000

function absoluteImageUrl(image) {
  if (!image) return ''
  try { return new URL(image, `${config.siteUrl}/`).toString() } catch (_) { return '' }
}

async function sendDeliveredPurchaseNotification(orderNo) {
  const { token, channelId } = config.discordPurchase
  if (!token || !channelId) {
    console.warn('[discord-purchase] DISCORD_BOT_TOKEN veya DISCORD_PURCHASE_CHANNEL_ID ayarlı değil; bildirim atlandı.')
    return false
  }

  const now = new Date()
  const staleClaim = new Date(now.getTime() - CLAIM_TTL_MS)
  // Atomic claim prevents duplicate messages if two admin requests update the same order together.
  const order = await Order.findOneAndUpdate(
    {
      orderNo,
      status: 'teslim-edildi',
      discordPurchaseNotifiedAt: null,
      $or: [
        { discordPurchaseNotificationClaimedAt: null },
        { discordPurchaseNotificationClaimedAt: { $lt: staleClaim } },
      ],
    },
    { $set: { discordPurchaseNotificationClaimedAt: now } },
    { new: true }
  )
  if (!order) return false

  const term = Number(order.termMonths) > 1 ? `${order.termMonths} Ay` : (order.delivery || 'Tek seferlik')
  const discordName = order.customer && order.customer.discord ? order.customer.discord : 'Belirtilmedi'
  const fields = [
    { name: '🧾 Sipariş No', value: `\`${order.orderNo}\``, inline: true },
    { name: '🛒 İşlem Türü', value: 'SATIN ALIM', inline: true },
    { name: '👤 Müşteri', value: String((order.customer && order.customer.name) || 'Belirtilmedi').slice(0, 200), inline: true },
    { name: '💬 Discord', value: String(discordName).slice(0, 200), inline: true },
    { name: '📦 Ürün', value: String(order.productName || 'Ürün').slice(0, 200), inline: true },
    { name: '⏳ Süre', value: String(term).slice(0, 200), inline: true },
    { name: '💰 Tutar', value: `${Number(order.price).toLocaleString('tr-TR')} ${order.currency === 'TRY' ? 'TL' : String(order.currency || '')}`, inline: true },
    { name: '✅ Durum', value: 'TESLİM EDİLDİ', inline: true },
  ]

  const image = absoluteImageUrl(order.productImage)
  const embed = {
    title: 'Vexstar | Satın Alım Sistemi',
    description: '🎉 Yeni bir ürün başarıyla teslim edildi!',
    color: 0x8B5CF6,
    fields,
    footer: { text: 'Vexstar Development • vexstar.com.tr' },
    timestamp: new Date().toISOString(),
  }
  if (image) embed.thumbnail = { url: image }

  try {
    const response = await fetch(`${DISCORD_API}/channels/${encodeURIComponent(channelId)}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed], allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`Discord API ${response.status}: ${data.message || 'Mesaj gönderilemedi'}`)

    await Order.updateOne(
      { _id: order._id, discordPurchaseNotifiedAt: null },
      { $set: { discordPurchaseNotifiedAt: new Date(), discordPurchaseMessageId: data.id || '' }, $unset: { discordPurchaseNotificationClaimedAt: 1 } }
    )
    console.log(`[discord-purchase] ${order.orderNo} teslimat bildirimi gönderildi.`)
    return true
  } catch (err) {
    await Order.updateOne(
      { _id: order._id, discordPurchaseNotifiedAt: null },
      { $unset: { discordPurchaseNotificationClaimedAt: 1 } }
    ).catch(() => {})
    console.error(`[discord-purchase] ${order.orderNo} bildirimi gönderilemedi:`, err.message)
    return false
  }
}

module.exports = { sendDeliveredPurchaseNotification }
