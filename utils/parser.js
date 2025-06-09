const pdf = require('pdf-parse');
const Transaction = require('../models/transaction.model');
const Upload = require('../models/upload.model');

// Helper function to clean and parse numeric values
const parseAmount = (str) => {
  if (!str || typeof str !== 'string') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
};

// Parser for Bank of Baroda statements
const parseBankOfBaroda = (text, uploadId) => {
  const transactions = [];
  let totalDebit = 0;
  let totalCredit = 0;
  let finalBalance = 0;

  const lines = text.split('\n');
  const transactionRegex = /^(\d{2}-\d{2}-\d{4})\s+/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (transactionRegex.test(line)) {
      // Simple split logic; for production, regex is more robust
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 4) {
        const debit = parseAmount(parts[parts.length - 3]);
        const credit = parseAmount(parts[parts.length - 2]);
        const balanceStr = parts[parts.length - 1];

        if (balanceStr) {
            const closingBalance = parseAmount(balanceStr.replace(' Cr', ''));
            const transaction = {
              uploadId,
              transactionDate: new Date(parts[0].split('-').reverse().join('-')),
              description: parts[1],
              debit,
              credit,
              closingBalance,
              chequeNumber: parts.length > 5 ? parts[2] : null
            };
            transactions.push(transaction);
            totalDebit += debit;
            totalCredit += credit;
            finalBalance = closingBalance;
        }
      }
    }
  }
  return { transactions, totalDebit, totalCredit, finalBalance };
};

// Main parsing function
const parsePdf = async (filePath, uploadId) => {
  try {
    const dataBuffer = require('fs').readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    let result;

    if (text.includes("Bank of Baroda")) {
      result = parseBankOfBaroda(text, uploadId);
    } else {
      // Add other bank parsers here (e.g., parseKotak, parseICICI)
      throw new Error("Unsupported bank statement format.");
    }
    
    if (result && result.transactions.length > 0) {
      await Transaction.insertMany(result.transactions);
      await Upload.findByIdAndUpdate(uploadId, {
        status: 'Completed',
        totalDebit: result.totalDebit,
        totalCredit: result.totalCredit,
        closingBalance: result.finalBalance,
      });
    } else {
      throw new Error("No transactions were extracted.");
    }

  } catch (error) {
    await Upload.findByIdAndUpdate(uploadId, { status: 'Failed' });
    console.error(`Failed to parse ${filePath}:`, error.message);
  }
};

module.exports = { parsePdf };