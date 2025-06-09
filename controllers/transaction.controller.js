const Upload = require('../models/upload.model');
const Transaction = require('../models/transaction.model');
const { parsePdf } = require('../utils/parser');
const { Parser } = require('json2csv');

exports.uploadStatements = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'No files were uploaded.' });
  }

  const uploads = [];
  for (const file of req.files) {
    const upload = new Upload({
      fileName: file.originalname,
      user: 'hardcoded_user'
    });
    const savedUpload = await upload.save();
    uploads.push(savedUpload);
    
    // Start parsing in the background (asynchronously)
    parsePdf(file.path, savedUpload._id);
  }

  res.status(202).send({
    message: `${uploads.length} files uploaded successfully and are being processed.`,
    uploads: uploads.map(u => ({ uploadId: u._id, fileName: u.fileName, status: u.status }))
  });
};

exports.downloadCsv = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const transactions = await Transaction.find({ uploadId }).lean();

    if (transactions.length === 0) {
      return res.status(404).send({ message: 'No transactions found for this upload ID.' });
    }
    
    // Map data to create 'amount' and 'type' fields
    const formattedTransactions = transactions.map(t => ({
        'Transaction Date': t.transactionDate.toISOString().split('T')[0],
        'Description': t.description,
        'Amount': t.credit > 0 ? t.credit : t.debit,
        'Transaction Type': t.credit > 0 ? 'Credit' : 'Debit',
        'Closing Balance': t.closingBalance,
        'Cheque Number': t.chequeNumber || ''
    }));

    const fields = ['Transaction Date', 'Description', 'Amount', 'Transaction Type', 'Closing Balance', 'Cheque Number'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedTransactions);

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions-${uploadId}.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).send({ message: 'Failed to generate CSV.', error: error.message });
  }
};