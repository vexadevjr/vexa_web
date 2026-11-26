
'use strict'

const config = require('../config/appConfig')
const Order = require('../models/Order')

const DISCORD_API = 'https://discord.com/api/v10'
const CLAIM_TTL_MS = 5 * 60 * 1000

function absoluteImageUrl(image) {
  if (!image) return ''
  try {
    return new URL(image, `${config.siteUrl}/`).toString()
  } catch (_) {
    return ''
  }
}

async function sendDeliveredPurchaseNotification(orderNo) {
  const { token, channelId } = config.discordPurchase

  if (!token || !channelId) {
    console.warn('[discord-purchase] Discord ayarları eksik.')
    return false
  }

  const now = new Date()
  const staleClaim = new Date(now.getTime() - CLAIM_TTL_MS)

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

  const term = Number(order.termMonths) > 1
    ? `${order.termMonths} Ay`
    : order.termMonths === 1
      ? '1 Ay'
      : (order.delivery || 'Tek seferlik')

  const customerName = String(
    order.customer?.name || 'Belirtilmedi'
  ).slice(0, 200)

  const discordName = String(
    order.customer?.discord || 'Belirtilmedi'
  ).slice(0, 200)

  const productName = String(
    order.productName || 'Ürün'
  ).slice(0, 200)

  const amount =
    `${Number(order.price).toLocaleString('tr-TR')} ${
      order.currency === 'TRY' ? 'TL' : String(order.currency || '')
    }`

  const fields = [
    {
      name: '📋  SİPARİŞ DETAYLARI',
      value: '\u200b',
      inline: false,
    },
    {
      name: '🔗 Sipariş Numarası',
      value: `\`${String(order.orderNo).slice(0, 80)}\``,
      inline: true,
    },
    {
      name: '🛒 İşlem Türü',
      value: '**SATIN ALIM**',
      inline: true,
    },
    {
      name: '👤  MÜŞTERİ BİLGİLERİ',
      value: '\u200b',
      inline: false,
    },
    {
      name: '👑 Müşteri',
      value: customerName,
      inline: true,
    },
    {
      name: '💬 Discord',
      value: discordName,
      inline: true,
    },
    {
      name: '📦  ÜRÜN DETAYLARI',
      value: '\u200b',
      inline: false,
    },
    {
      name: '🛍️ Ürün',
      value: productName,
      inline: true,
    },
    {
      name: '⏳ Süre',
      value: term,
      inline: true,
    },
    {
      name: '💰 Tutar',
      value: `**${amount}**`,
      inline: true,
    },
    {
      name: '✅ Durum',
      value: '**TESLİM EDİLDİ**',
      inline: true,
    },
  ]

  const productImage = absoluteImageUrl(order.productImage)
  const logo = absoluteImageUrl('/vexstar-logo.png')

  const embed = {
    title: 'Vexstar | Satın Alım Sistemi',
    url: config.siteUrl,
    description:
      '🎉 **Yeni bir ürün başarıyla teslim edildi!**\n' +
      'Sipariş teslimat işlemi başarıyla tamamlandı.',
    color: 0x4F8FEF,
    fields,
    footer: {
      text: 'VEXSTAR DEVELOPMENT  •  vexstar.com.tr',
    },
    timestamp: new Date().toISOString(),
  }

  if (logo) embed.thumbnail = { url: logo }
  if (productImage) embed.image = { url: productImage }

  try {
    const response = await fetch(
      `${DISCORD_API}/channels/${encodeURIComponent(channelId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
          allowed_mentions: { parse: [] },
        }),
        signal: AbortSignal.timeout(10000),
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        `Discord API ${response.status}: ${
          data.message || 'Mesaj gönderilemedi'
        }`
      )
    }

    await Order.updateOne(
      {
        _id: order._id,
        discordPurchaseNotifiedAt: null,
      },
      {
        $set: {
          discordPurchaseNotifiedAt: new Date(),
          discordPurchaseMessageId: data.id || '',
        },
        $unset: {
          discordPurchaseNotificationClaimedAt: 1,
        },
      }
    )

    console.log(
      `[discord-purchase] ${order.orderNo} bildirimi gönderildi.`
    )

    return true

  } catch (err) {
    await Order.updateOne(
      {
        _id: order._id,
        discordPurchaseNotifiedAt: null,
      },
      {
        $unset: {
          discordPurchaseNotificationClaimedAt: 1,
        },
      }
    ).catch(() => {})

    console.error(
      `[discord-purchase] ${order.orderNo} bildirimi gönderilemedi:`,
      err.message
    )

    return false
  }
}

module.exports = { sendDeliveredPurchaseNotification }
