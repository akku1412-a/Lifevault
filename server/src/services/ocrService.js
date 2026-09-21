const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { normalizeExtractedText } = require('../utils/textNormalizer');
const logger = require('../utils/logger');

class OcrService {
  /**
   * Extract text from PDF or Image document buffer
   * @param {Buffer} buffer 
   * @param {string} mimeType 
   * @returns {Promise<string>}
   */
  async extractText(buffer, mimeType) {
    if (!buffer || buffer.length === 0) {
      return '';
    }

    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPdf(buffer);
      } else if (
        mimeType === 'image/jpeg' ||
        mimeType === 'image/jpg' ||
        mimeType === 'image/png' ||
        mimeType === 'image/webp'
      ) {
        return await this.extractFromImage(buffer);
      } else {
        logger.warn(`Unsupported MIME type for text extraction: ${mimeType}`);
        return '';
      }
    } catch (err) {
      logger.error(`Document text extraction error (${mimeType}): ${err.message}`);
      return '';
    }
  }

  async extractFromPdf(buffer) {
    try {
      const data = await pdfParse(buffer, {
        max: 20 // Limit to first 20 pages to protect memory
      });
      const text = data && data.text ? data.text : '';
      return normalizeExtractedText(text);
    } catch (err) {
      logger.error('PDF parsing failure:', err.message);
      return '';
    }
  }

  async extractFromImage(buffer) {
    try {
      logger.info('Executing Tesseract OCR extraction on image buffer...');
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress % 0.5 === 0) {
            logger.debug(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        }
      });
      const text = data && data.text ? data.text : '';
      logger.info(`OCR extraction completed. Extracted ${text.length} characters.`);
      return normalizeExtractedText(text);
    } catch (err) {
      logger.error('Tesseract OCR parsing failure:', err.message);
      return '';
    }
  }
}

module.exports = new OcrService();
