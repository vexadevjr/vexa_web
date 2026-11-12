'use strict'
const mongoose = require('mongoose')

const replySchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['admin', 'user'], required: true },
    text: { type: String, required: true, maxlength: 3000 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
)

const messageSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, maxlength: 60 },
    message: { type: String, required: true, maxlength: 3000 },
    orderNo: { type: String, default: '', maxlength: 30 },
    status: { type: String, enum: ['acik', 'yanitlandi', 'kapali'], default: 'acik' },
    replies: { type: [replySchema], default: [] },
    unreadByAdmin: { type: Boolean, default: true },
    unreadByUser: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema)
