'use strict'
const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true, maxlength: 40 }, value: { type: mongoose.Schema.Types.Mixed } },
  { timestamps: true, minimize: false }
)

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema)
