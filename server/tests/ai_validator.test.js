const geminiService = require('../src/services/geminiService');
const Document = require('../src/models/Document');

describe('AI Validation & Heuristic Intelligence', () => {
  it('should extract structured metadata via heuristic fallback for warranty documents', () => {
    const text = 'Samsung Electronics Co. Ltd. 24 Months Warranty Certificate for Smart Refrigerator. Valid until 2027-12-31.';
    const result = geminiService.heuristicFallback(text, 'samsung_warranty_card.pdf');

    expect(result.category).toBe('warranty');
    expect(result.documentType).toBe('Warranty Certificate');
    expect(result.expiryDate).toBeInstanceOf(Date);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.tags).toContain('warranty');
  });

  it('should extract structured metadata via heuristic fallback for bills', () => {
    const text = 'Pacific Gas & Electric Utility Bill. Amount due $142.50. Due Date: 2026-10-15.';
    const result = geminiService.heuristicFallback(text, 'electric_bill.pdf');

    expect(result.category).toBe('bills');
    expect(result.expiryDate).toBeInstanceOf(Date);
  });

  it('should validate and sanitize raw AI output, suppressing hallucinations', () => {
    const rawAiOutput = {
      documentType: 'Passport',
      category: 'INVALID_CATEGORY_NAME', // invalid category
      title: 'US Passport',
      summary: 'Valid passport identification.',
      issuer: 'Department of State',
      documentDate: '2020-05-10',
      expiryDate: '2030-05-10',
      importantDates: [{ label: 'Renewal', date: '2030-05-10' }],
      confidence: 0.95,
      tags: ['passport', 'travel']
    };

    const validated = geminiService.validateAndSanitizeAiOutput(rawAiOutput, 'passport.pdf');

    expect(validated.documentType).toBe('Passport');
    expect(validated.category).toBe('other'); // Defaulted because invalid category name was provided
    expect(validated.issuer).toBe('Department of State');
    expect(validated.confidence).toBe(0.95);
    expect(validated.expiryDate).toBeInstanceOf(Date);
  });

  it('should accurately calculate document expiry statuses based on date boundaries', () => {
    const now = new Date();

    // Past date -> expired
    const expiredDoc = new Document({
      userId: '507f1f77bcf86cd799439011',
      originalFileName: 'test.pdf',
      storedFileName: 'test.pdf',
      storageKey: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 100,
      fileHash: 'hash1',
      title: 'Expired ID',
      expiryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    });
    expect(expiredDoc.updateExpiryStatus()).toBe('expired');

    // Within 20 days -> expiring_soon
    const soonDoc = new Document({
      userId: '507f1f77bcf86cd799439011',
      originalFileName: 'test.pdf',
      storedFileName: 'test.pdf',
      storageKey: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 100,
      fileHash: 'hash2',
      title: 'Expiring Insurance',
      expiryDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
    });
    expect(soonDoc.updateExpiryStatus()).toBe('expiring_soon');

    // 60 days ahead -> active
    const activeDoc = new Document({
      userId: '507f1f77bcf86cd799439011',
      originalFileName: 'test.pdf',
      storedFileName: 'test.pdf',
      storageKey: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 100,
      fileHash: 'hash3',
      title: 'Valid Contract',
      expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    });
    expect(activeDoc.updateExpiryStatus()).toBe('active');

    // No expiry date -> no_expiry
    const permanentDoc = new Document({
      userId: '507f1f77bcf86cd799439011',
      originalFileName: 'test.pdf',
      storedFileName: 'test.pdf',
      storageKey: 'test.pdf',
      mimeType: 'application/pdf',
      fileSize: 100,
      fileHash: 'hash4',
      title: 'Birth Certificate',
      expiryDate: null
    });
    expect(permanentDoc.updateExpiryStatus()).toBe('no_expiry');
  });
});
