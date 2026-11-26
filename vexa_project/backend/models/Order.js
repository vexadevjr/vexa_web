'use strict'
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // total for the chosen term, calculated on the server
    termMonths: { type: Number, default: 1 },
    monthlyPrice: { type: Number, default: null },
    currency: { type: String, default: 'TRY' },
    customer: {
      name: { type: String, required: true, maxlength: 80 },
      email: { type: String, required: true, lowercase: true, maxlength: 254 },
      discord: { type: String, default: '', maxlength: 40 },
    },
    note: { type: String, default: '', maxlength: 1000 },
    delivery: { type: String, default: '', maxlength: 60 }, // delivery estimate at the time of ordering
    history: { type: [new mongoose.Schema({ status: String, at: { type: Date, default: Date.now } }, { _id: false })], default: [] },
    legalAcceptedAt: { type: Date, default: null }, // distance-sales contract + pre-information accepted
    legalVersion: { type: String, default: '', maxlength: 20 },
    fields: { type: [new mongoose.Schema({ key: String, label: String, value: { type: String, default: '', maxlength: 600 }, secret: { type: Boolean, default: false } }, { _id: false })], default: [] },
    secretsPurgedAt: { type: Date, default: null },
    cancelReason: { type: String, default: '', maxlength: 300 },
    cancelledBy: { type: String, enum: ['customer', 'admin', ''], default: '' },
    status: { type: String, enum: ['yeni', 'onaylandi', 'hazirlaniyor', 'teslim-edildi', 'iptal'], default: 'yeni' },
    discordPurchaseNotifiedAt: { type: Date, default: null },
    discordPurchaseMessageId: { type: String, default: '' },
    discordPurchaseNotificationClaimedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
