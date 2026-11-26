
'use strict'

const config = require('../config/appConfig')
const Order = require('../models/Order')
const User = require('../models/User')

const DISCORD_API = 'https://discord.com/api/v10'
const CLAIM_TTL_MS = 5 * 60 * 1000

function safeText(value, max = 200) {
  return String(value || 'Belirtilmedi')
    .replace(/[`*_~|]/g, '')
    .slice(0, max)
}

function chip(value) {
  return `\`${safeText(value, 100)}\``
}

function validDiscordUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      ['discord.gg', 'discord.com', 'www.discord.com'].includes(url.hostname)
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}

function absoluteImageUrl(image) {
  if (!image) return ''
  try {
    return new URL(image, `${config.siteUrl}/`).toString()
  } catch {
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
        { discordPurchaseNotificationClaimedAt: { $lt: staleClaim } }
      ]
    },
    {
      $set: {
        discordPurchaseNotificationClaimedAt: now
      }
    },
    { new: true }
  )

  if (!order) return false

  try {
    const fields = order.fields || []

    const getField = (key) =>
      fields.find(f => f.key === key && !f.secret)?.value || ''

    let discordId = ''

    if (order.user) {
      const user = await User.findById(order.user)
        .select('discordId')
        .lean()

      discordId = user?.discordId || ''
    }

    const profileUrl = /^\d{17,20}$/.test(discordId)
      ? `https://discord.com/users/${discordId}`
      : ''

    const serverInvite = validDiscordUrl(getField('serverInvite'))

    const serverId = getField('discordServerId')
    const serverUrl = serverInvite ||
      (/^\d{17,20}$/.test(serverId)
        ? `https://discord.com/channels/${serverId}`
        : '')

    const customerName = safeText(order.customer?.name)
    const discordName = safeText(order.customer?.discord)
    const productName = safeText(order.productName)
    const orderNumber = safeText(order.orderNo)

    const term = Number(order.termMonths) > 0
      ? `${order.termMonths} Ay`
      : order.delivery || 'Tek seferlik'

    const amount =
      `${Number(order.price).toLocaleString('tr-TR')} ${
        order.currency === 'TRY' ? 'TL' : order.currency || ''
      }`

    const customerValue = profileUrl
      ? `[${customerName}](<${profileUrl}>)`
      : `**${customerName}**`

    const serverValue = serverUrl
      ? `[${discordName}](<${serverUrl}>)`
      : `**${discordName}**`

    const embed = {
      title: 'Vexstar | Satın Alım Sistemi',
      url: config.siteUrl,
      description:
        '🎉 **Yeni bir ürün başarıyla teslim edildi!**\n' +
        'Sipariş teslimat işlemi başarıyla tamamlandı.',
      color: 0x4F8FEF,

      fields: [
        {
          name: '📋  SİPARİŞ DETAYLARI',
          value: '\u200b',
          inline: false
        },
        {
          name: '🔗 Sipariş No',
          value: chip(orderNumber),
          inline: true
        },
        {
          name: '🛒 İşlem Türü',
          value: chip('SATIN ALIM'),
          inline: true
        },
        {
          name: '👤  MÜŞTERİ BİLGİLERİ',
          value: '\u200b',
          inline: false
        },
        {
          name: '👑 Müşteri',
          value: customerValue,
          inline: true
        },
        {
          name: '💬 Discord',
          value: serverValue,
          inline: true
        },
        {
          name: '📦  ÜRÜN DETAYLARI',
          value: '\u200b',
          inline: false
        },
        {
          name: '🛍️ Ürün',
          value: `**${productName}**`,
          inline: true
        },
        {
          name: '⏳ Süre',
          value: chip(term),
          inline: true
        },
        {
          name: '💰 Tutar',
          value: chip(amount),
          inline: true
        },
        {
          name: '✅ Durum',
          value: chip('TESLİM EDİLDİ'),
          inline: true
        }
      ],

      footer: {
        text: 'VEXSTAR DEVELOPMENT • vexstar.com.tr'
      },

      timestamp: new Date().toISOString()
    }

    const productImage = absoluteImageUrl(order.productImage)
    const logo = absoluteImageUrl('/vexstar-logo.png')

    if (logo) {
      embed.thumbnail = { url: logo }
    }

    if (productImage) {
      embed.image = { url: productImage }
    }

    // Gerçek Discord bağlantı butonları
    const buttons = []

    if (profileUrl) {
      buttons.push({
        type: 2,
        style: 5,
        label: 'Müşteri Profilini Aç',
        url: profileUrl
      })
    }

    if (serverUrl) {
      buttons.push({
        type: 2,
        style: 5,
        label: 'Sunucuya Git',
        url: serverUrl
      })
    }

    const components = buttons.length
      ? [{
          type: 1,
          components: buttons
        }]
      : []

    const response = await fetch(
      `${DISCORD_API}/channels/${encodeURIComponent(channelId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embeds: [embed],
          components,
          allowed_mentions: { parse: [] }
        }),
        signal: AbortSignal.timeout(10000)
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
        discordPurchaseNotifiedAt: null
      },
      {
        $set: {
          discordPurchaseNotifiedAt: new Date(),
          discordPurchaseMessageId: data.id || ''
        },
        $unset: {
          discordPurchaseNotificationClaimedAt: 1
        }
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
        discordPurchaseNotifiedAt: null
      },
      {
        $unset: {
          discordPurchaseNotificationClaimedAt: 1
        }
      }
    ).catch(() => {})

    console.error(
      '[discord-purchase] Bildirim hatası:',
      err.message
    )

    return false
  }
}

module.exports = { sendDeliveredPurchaseNotification }
