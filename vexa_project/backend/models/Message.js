'use strict'
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, maxlength: 60 },
    message: { type: String, required: true, maxlength: 3000 },
    orderNo: { type: String, default: '', maxlength: 30 },
    status: { type: String, enum: ['acik', 'yanitlandi', 'kapali'], default: 'acik' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema)
