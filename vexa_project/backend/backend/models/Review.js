'use strict'
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // one review per customer
    name: { type: String, required: true, maxlength: 40 }, // public display name ("Ahmet Y.")
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, minlength: 10, maxlength: 600 },
    product: { type: String, default: '', maxlength: 80 },
    verified: { type: Boolean, default: false }, // customer has at least one delivered order
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema)
