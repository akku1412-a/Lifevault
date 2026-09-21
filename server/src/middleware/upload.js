const multer = require('multer');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

// Store temporarily in memory to inspect buffer magic bytes and calculate SHA-256 hash
const storage = multer.memoryStorage();

// Supported MIME types
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

// Magic byte verification to ensure file content actually matches extension
function verifyFileSignature(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // PDF check: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return 'image/png';
  }

  // JPEG check: FF D8 FF
  if (
    buffer[0] === 0xFF &&
    buffer[1] === 0xD8 &&
    buffer[2] === 0xFF
  ) {
    return 'image/jpeg';
  }

  // WEBP check: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // WEBP
  ) {
    return 'image/webp';
  }

  return null;
}

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, PNG, JPG, JPEG, WEBP`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 25 MB default
    files: 1
  },
  fileFilter
});

// Middleware wrapper that inspects buffer magic bytes
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, 'No document file uploaded', 'FILE_MISSING');
  }

  const detectedMime = verifyFileSignature(req.file.buffer);
  if (!detectedMime) {
    return ApiResponse.badRequest(
      res,
      'Invalid file content. File binary signature does not match any allowed document formats (PDF, JPEG, PNG, WEBP).',
      'FILE_SIGNATURE_MISMATCH'
    );
  }

  // Assign verified MIME type
  req.file.verifiedMimeType = detectedMime;
  next();
};

module.exports = {
  upload,
  validateUploadedFile,
  verifyFileSignature
};
