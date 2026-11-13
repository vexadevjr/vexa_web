'use strict'
const crypto = require('crypto')

// e.g. VX-LZ3K9A1F2B
function makeNo(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`
}

module.exports = { makeNo }
