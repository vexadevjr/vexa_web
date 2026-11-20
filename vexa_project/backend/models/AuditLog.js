'use strict'
const mongoose = require('mongoose')

// Append-only admin activity log. Every entry carries the hash of the previous one (hash chain), so any
// edit or deletion in the middle of the log is detected by GET /api/admin/audit/verify.
// There is deliberately NO update or delete route, and the model itself refuses those operations.
const auditSchema = new mongoose.Schema(
  {
    seq: { type: Number, required: true, unique: true, immutable: true },
    at: { type: Date, required: true, immutable: true },
    actor: { type: String, required: true, immutable: true }, // admin e-posta
    ip: { type: String, default: '', immutable: true },
    ua: { type: String, default: '', immutable: true },
    category: { type: String, required: true, immutable: true }, // oturum, urun, indirim, siparis, musteri, ...
    action: { type: String, required: true, immutable: true },
    summary: { type: String, required: true, immutable: true }, // okunabilir tek cümle
    details: { type: String, default: '', immutable: true }, // JSON: önceki / yeni değerler
    prevHash: { type: String, required: true, immutable: true },
    hash: { type: String, required: true, immutable: true },
  },
  { versionKey: false, strict: true }
)

const locked = function lockedOp() {
  throw new Error('Denetim kayıtları değiştirilemez ve silinemez.')
}
;['updateOne', 'updateMany', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndReplace', 'findOneAndDelete', 'findOneAndRemove', 'remove'].forEach((op) => auditSchema.pre(op, locked))
auditSchema.pre('deleteOne', { document: true, query: false }, locked)
auditSchema.pre('save', function onSave() {
  if (!this.isNew) throw new Error('Denetim kayıtları değiştirilemez ve silinemez.')
})

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema)
