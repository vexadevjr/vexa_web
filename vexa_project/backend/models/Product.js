'use strict'
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    category: { type: String, required: true, enum: ['discord-bot', 'web', 'server', 'software'], index: true },
    subCategory: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    tagline: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    price: { type: Number, default: null, min: 0 }, // null = "teklif al"
    oldPrice: { type: Number, default: null, min: 0 }, // original price shown struck-through when discounted
    priceFrom: { type: Boolean, default: false },
    currency: { type: String, default: 'TRY' },
    period: { type: String, default: 'tek seferlik' },
    deliveryDays: { type: Number, default: null, min: 0 }, // legacy
    delivery: { type: String, trim: true, default: '', maxlength: 60 }, // free text, e.g. "5-7 iş günü"
    images: { type: [String], default: [] }, // /api/media/<id>
    details: { type: String, trim: true, default: '', maxlength: 4000 }, // long description (product page)
    requirements: { type: [String], default: [] }, // what the customer must provide / prepare
    metaTitle: { type: String, trim: true, default: '', maxlength: 70 },
    metaDescription: { type: String, trim: true, default: '', maxlength: 170 },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema)
