async function sendOrderBotMessage(order, account) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_SALES_CHANNEL_ID;

  if (!botToken || !channelId) return;

  // Müşteri adını gizlilik için kısmi maskeler (Örn: Vex***)
  const rawName = (order.customer && order.customer.name) || (account && account.name) || 'Müşteri';
  const maskedName = rawName.length > 3 ? `${rawName.slice(0, 3)}***` : rawName;

  // Sipariş formundan gelen özel alanları (Sunucu ID, Sunucu Linki vb.) okur
  const fields = Array.isArray(order.fields) ? order.fields : [];
  const getField = (keywords) => {
    const found = fields.find((f) =>
      keywords.some((k) => String(f.key || f.label || '').toLowerCase().includes(k))
    );
    return found && found.value ? found.value : null;
  };

  const discordId = (account && account.discordId) || getField(['kullanıcı id', 'user id', 'discordid']) || 'Kayıtlı Üye';
  const serverInfo = getField(['sunucu', 'server', 'davet', 'invite']) || 'Özel Sunucu';
  const durationText = order.termMonths ? `${order.termMonths} Ay` : 'Tek Seferlik';

  const embed = {
    title: 'Vexstar | Satın Alım Sistemi',
    color: 0x7c3aed,
    thumbnail: {
      url: 'https://vexstar.com.tr'
    },
    description: [
      '### 🟪 Sipariş Detayları',
      `🔹 **Sipariş No:** \`${order.orderNo}\``,
      `💼 **İşlem Türü:** \`SATIN ALIM\``,
      '',
      '### 👤 Müşteri Bilgileri',
      `👑 **Müşteri:** \`${maskedName}\``,
      `🆔 **ID:** \`${discordId}\``,
      `🔗 **Sunucu:** \`${serverInfo}\``,
      '',
      '### 📦 Ürün Detayları',
      `🛠️ **Servis:** \`${order.productName}\``,
      `⏳ **Süre:** \`${durationText}\``,
      `💵 **Tutar:** \`${order.price} TL\``
    ].join('\n'),
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
      body: JSON.stringify({ embeds: [embed] })
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
