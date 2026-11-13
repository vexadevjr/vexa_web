'use strict'
const mongoose = require('mongoose')

const visitSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, index: true, maxlength: 64 },
    path: { type: String, required: true, maxlength: 200 },
    ua: { type: String, default: '', maxlength: 200 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
)

// Visitor logs are deleted automatically after 400 days (data-retention / KVKK friendly).
visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 400 * 24 * 60 * 60 })

module.exports = mongoose.models.Visit || mongoose.model('Visit', visitSchema)
