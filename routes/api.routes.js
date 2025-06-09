const express = require('express');
const multer = require('multer');
const controller = require('../controllers/transaction.controller');
const router = express.Router();

// Configure Multer for file storage on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// API routes
router.post('/upload', upload.array('statements'), controller.uploadStatements);
router.get('/download/:uploadId', controller.downloadCsv);

module.exports = router;