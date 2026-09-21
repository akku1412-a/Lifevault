/**
 * Text normalizer and sanitizer for extracted document text
 */

function normalizeExtractedText(rawText, maxChars = 15000) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  let cleaned = rawText
    // Replace non-breaking spaces and irregular whitespace
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Replace control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse 3 or more consecutive newlines into 2
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple spaces into one
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // Bounded truncation to prevent excessive token consumption
  if (cleaned.length > maxChars) {
    cleaned = cleaned.substring(0, maxChars) + '\n...[Text content truncated for optimal AI analysis]';
  }

  return cleaned;
}

module.exports = {
  normalizeExtractedText
};
