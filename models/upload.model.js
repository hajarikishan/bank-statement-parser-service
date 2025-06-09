const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  uploadDate: { type: Date, default: Date.now },
  fileName: { type: String, required: true },
  user: { type: String, required: true },
  status: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' },
  totalCredit: { type: Number, default: 0 },
  totalDebit: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 }
});

const Upload = mongoose.model('Upload', uploadSchema);
module.exports = Upload;