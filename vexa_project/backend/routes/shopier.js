const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order'); // Mevcut sipariş modeliniz

// 1. ÖDEME BAŞLATMA (Frontend burayı çağırır)
router.post('/create', async (req, res) => {
  try {
    const { orderId, amount, buyerName, buyerEmail, buyerPhone, productName } = req.body;

    const apiKey = process.env.SHOPIER_API_KEY;
    const apiSecret = process.env.SHOPIER_API_SECRET;
    const randomNr = Math.floor(100000 + Math.random() * 900000).toString();

    const args = {
      API_key: apiKey,
      website_index: 1,
      platform_order_id: orderId,
      product_name: productName || 'Vexstar Dijital Hizmet',
      product_type: 1, // 1: Dijital Ürün / İndirilebilir
      buyer_name: buyerName || 'Musteri',
      buyer_surname: 'Vexstar',
      buyer_email: buyerEmail || 'musteri@vexstar.com.tr',
      buyer_account_age: 0,
      buyer_id_nr: orderId,
      buyer_phone: buyerPhone || '05000000000',
      billing_address: 'Dijital Hizmet Teslimati',
      billing_city: 'Istanbul',
      billing_country: 'TR',
      billing_postcode: '34000',
      shipping_address: 'Dijital Hizmet Teslimati',
      shipping_city: 'Istanbul',
      shipping_country: 'TR',
      shipping_postcode: '34000',
      total_order_value: Number(amount).toFixed(2),
      currency: 0, // 0: TL
      platform: 0,
      is_in_frame: 0,
      current_language: 0, // 0: Türkçe
      modul_version: '1.0.4',
      random_nr: randomNr
    };

    // Shopier HMAC-SHA256 Güvenlik İmzası
    const dataToSign = args.random_nr + args.platform_order_id + args.total_order_value + args.currency;
    args.signature = crypto.createHmac('sha256', apiSecret).update(dataToSign).digest('base64');

    // Otomatik POST Formu HTML çıktısı döndürür
    const inputs = Object.entries(args)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
      .join('');

    const html = `
      <form id="shopier_form" action="https://shopier.com" method="post">
        ${inputs}
      </form>
      <script>document.getElementById('shopier_form').submit();</script>
    `;

    res.json({ ok: true, html });
  } catch (err) {
    console.error('Shopier başlatma hatası:', err);
    res.status(500).json({ ok: false, message: 'Ödeme başlatılamadı.' });
  }
});

// 2. ÖDEME DOĞRULAMA / CALLBACK (Shopier ödeme bitince buraya istek atar)
router.post('/callback', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { status, platform_order_id, random_nr, signature } = req.body;
    const apiSecret = process.env.SHOPIER_API_SECRET;

    // İmza Doğrulama (Sahte istekleri engeller)
    const expectedSig = crypto
      .createHmac('sha256', apiSecret)
      .update(`${random_nr}${platform_order_id}`)
      .digest('base64');

    if (signature !== expectedSig) {
      return res.status(403).send('Gecersiz imza');
    }

    if (status === 'success') {
      // Siparişi veritabanında "Ödendi" olarak güncelle
      await Order.findByIdAndUpdate(platform_order_id, {
        status: 'paid',
        paymentStatus: 'paid',
        paidAt: new Date()
      });
      return res.redirect(`${process.env.SITE_URL}/hesabim?odeme=basarili`);
    }

    return res.redirect(`${process.env.SITE_URL}/hesabim?odeme=basarisiz`);
  } catch (err) {
    console.error('Shopier callback hatası:', err);
    return res.redirect(`${process.env.SITE_URL}/hesabim?odeme=hata`);
  }
});

module.exports = router;
