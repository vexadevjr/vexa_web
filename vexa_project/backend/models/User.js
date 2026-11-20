'use strict'
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // absent for accounts created through Google / Discord
    passwordHash: { type: String, select: false },
    avatar: { type: String, default: '', maxlength: 500 }, // https image URL from Google / Discord
    termsAcceptedAt: { type: Date, default: null },
    termsVersion: { type: String, default: '', maxlength: 20 },
    disabled: { type: Boolean, default: false, index: true }, // blocked by an admin
    disabledAt: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    googleId: { type: String, index: { unique: true, sparse: true } },
    discordId: { type: String, index: { unique: true, sparse: true } },
    role: { type: String, enum: ['user'], default: 'user' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
