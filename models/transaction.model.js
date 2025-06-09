const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  transactionDate: { type: Date, required: true },
  description: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  closingBalance: { type: Number, required: true },
  chequeNumber: { type: String }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;