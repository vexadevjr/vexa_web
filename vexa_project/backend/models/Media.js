'use strict'
const mongoose = require('mongoose')

// Uploaded photos (project / product screenshots). Stored in MongoDB because hosting disks are ephemeral.
const mediaSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    mime: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

module.exports = mongoose.models.Media || mongoose.model('Media', mediaSchema)
