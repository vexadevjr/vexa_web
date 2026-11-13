'use strict'
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // absent for accounts created through Google / Discord
    passwordHash: { type: String, select: false },
    avatar: { type: String, default: '', maxlength: 500 }, // https image URL from Google / Discord
    emailVerified: { type: Boolean, default: false },
    googleId: { type: String, index: { unique: true, sparse: true } },
    discordId: { type: String, index: { unique: true, sparse: true } },
    role: { type: String, enum: ['user'], default: 'user' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
