async function sendOrderBotMessage(order) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_SALES_CHANNEL_ID;

  if (!botToken || !channelId) return;

  // Müşteri gizliliği için kullanıcı adını maskeler (Örn: Vex***)
  const rawName = order.customerName || order.user?.username || 'Müşteri';
  const maskedName = rawName.length > 3 ? `${rawName.slice(0, 3)}***` : rawName;

  const embed = {
    title: 'Vexstar | Satın Alım Sistemi',
    color: 0x7c3aed, // Vexstar kurumsal mor rengi
    thumbnail: {
      url: 'https://vexstar.com.tr'
    },
    description: [
      '### 🟪 Sipariş Detayları',
      `🔹 **Sipariş No:** \`${order.orderNumber || String(order._id).slice(-10).toUpperCase()}\``,
      `💼 **İşlem Türü:** \`SATIN ALIM\``,
      '',
      '### 👤 Müşteri Bilgileri',
      `👑 **Müşteri:** \`${maskedName}\``,
      `🆔 **ID:** \`${order.discordId || 'Belirtilmedi'}\``,
      `🔗 **Sunucu:** \`${order.serverName || 'Özel Sunucu'}\``,
      '',
      '### 📦 Ürün Detayları',
      `🛠️ **Servis:** \`${order.productName || 'Vexstar Hizmeti'}\``,
      `⏳ **Süre:** \`${order.durationLabel || '1 Ay'}\``,
      `💵 **Tutar:** \`${order.totalPrice || order.amount} TL\``
    ].join('\n'),
    image: {
      url: 'https://vexstar.com.tr' // Alt büyük banner (isteğe bağlı, istemezseniz bu satırı silin)
    },
    footer: {
      text: "Vexstar Bot's | vexstar.com.tr",
      icon_url: 'https://vexstar.com.tr'
    },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(`https://discord.com{channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Discord Bot mesaj hatası:', errData);
    }
  } catch (err) {
    console.error('Discord API bağlantı hatası:', err);
  }
}

module.exports = { sendOrderBotMessage };
