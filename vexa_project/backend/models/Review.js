'use strict'
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productSlug: { type: String, default: '', maxlength: 60, index: true }, // product the customer bought
    name: { type: String, required: true, maxlength: 40 }, // public display name ("Ahmet Y.")
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, minlength: 10, maxlength: 600 },
    product: { type: String, default: '', maxlength: 80 }, // product name at the time of the review
    verified: { type: Boolean, default: true }, // only buyers can review, so always true for new reviews
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
)
// one review per customer and product
reviewSchema.index({ user: 1, productSlug: 1 }, { unique: true })

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)
// the old schema had a unique index on `user` alone; sync drops it
mongoose.connection.once('connected', () => Review.syncIndexes().catch((e) => console.error('[reviews] index sync:', e.message)))

module.exports = Review
