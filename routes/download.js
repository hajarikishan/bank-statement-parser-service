const express = require('express');
const Transaction = require('../models/Transaction');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/:fileName', async (req, res) => {
  const fileName = req.params.fileName;
  const records = await Transaction.find({ "uploadMeta.fileName": fileName });

  const csvPath = path.join(__dirname, `../parsed/${Date.now()}-${fileName}.csv`);
  const csvWriter = createCsvWriter({
    path: csvPath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'description', title: 'Description' },
      { id: 'amount', title: 'Amount' },
      { id: 'type', title: 'Type' },
      { id: 'closingBalance', title: 'Closing Balance' },
      { id: 'chequeNo', title: 'Cheque No' }
    ]
  });

  await csvWriter.writeRecords(records);
  res.download(csvPath);
});

module.exports = router;