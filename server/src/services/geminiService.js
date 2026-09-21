const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        // Using gemini-1.5-flash for high speed, low cost, and structured output
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        logger.info('Gemini AI Service initialized successfully with gemini-1.5-flash');
      } catch (err) {
        logger.error('Failed to initialize Gemini AI client:', err.message);
        this.model = null;
      }
    } else {
      logger.warn('No GEMINI_API_KEY detected in environment. Operating in heuristic fallback mode.');
      this.model = null;
    }
  }

  /**
   * Analyze document text using Gemini or deterministic heuristic fallback
   */
  async analyzeDocument({ text, originalFileName, mimeType }) {
    if (this.model && text && text.trim().length > 20) {
      try {
        return await this.analyzeWithGemini(text, originalFileName);
      } catch (err) {
        logger.warn(`Gemini AI analysis failed (${err.message}). Falling back to heuristic extractor.`);
        return this.heuristicFallback(text, originalFileName);
      }
    }
    return this.heuristicFallback(text, originalFileName);
  }

  async analyzeWithGemini(text, originalFileName) {
    const prompt = `You are an expert document analysis engine. Analyze the following document text and return a strictly valid JSON object.
Do NOT hallucinate information. If you cannot confidently determine a field, return null for that field.

File Name: "${originalFileName}"

Document Content:
"""
${text}
"""

Return a JSON object conforming strictly to this format:
{
  "documentType": string or null (e.g. "Warranty", "Medical Bill", "Insurance Policy", "Certificate", "Employment Contract", "Driver's License", "Utility Bill", "Tax Form", "Receipt"),
  "category": string (MUST be one of: "identity", "education", "certificates", "finance", "bills", "receipts", "insurance", "warranty", "medical", "employment", "legal", "travel", "other"),
  "title": string (concise, clear, professional title for the document),
  "summary": string (2-3 concise sentences summarizing what this document is, who it belongs to or involves, and key terms or amounts),
  "issuer": string or null (organization, company, institution, or government agency that issued the document),
  "documentDate": string in ISO YYYY-MM-DD format or null,
  "expiryDate": string in ISO YYYY-MM-DD format or null (e.g., expiration date, warranty end date, valid-until date, due date),
  "importantDates": [
    { "label": string, "date": string in ISO YYYY-MM-DD format }
  ],
  "entities": [
    { "name": string, "type": string }
  ],
  "tags": [string] (3-6 relevant tags, e.g. ["Samsung", "Electronics", "Warranty"]),
  "confidence": number between 0.0 and 1.0
}

Return ONLY the raw JSON object, without any markdown formatting or commentary.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let jsonStr = response.text().trim();

    // Clean markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonStr.trim());
      return this.validateAndSanitizeAiOutput(parsed, originalFileName);
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON output:', parseError.message, 'Raw response:', jsonStr);
      return this.heuristicFallback(text, originalFileName);
    }
  }

  /**
   * Validate and sanitize AI JSON response to avoid corruption
   */
  validateAndSanitizeAiOutput(data, originalFileName) {
    const validCategories = new Set([
      'identity', 'education', 'certificates', 'finance', 'bills', 'receipts',
      'insurance', 'warranty', 'medical', 'employment', 'legal', 'travel', 'other'
    ]);

    const sanitized = {
      documentType: typeof data.documentType === 'string' ? data.documentType.trim() : null,
      category: typeof data.category === 'string' && validCategories.has(data.category.toLowerCase().trim())
        ? data.category.toLowerCase().trim()
        : 'other',
      title: typeof data.title === 'string' && data.title.trim().length > 0
        ? data.title.trim()
        : originalFileName.replace(/\.[^/.]+$/, ''),
      summary: typeof data.summary === 'string' ? data.summary.trim() : 'Document processed successfully.',
      issuer: typeof data.issuer === 'string' ? data.issuer.trim() : null,
      documentDate: this.parseValidDate(data.documentDate),
      expiryDate: this.parseValidDate(data.expiryDate),
      importantDates: Array.isArray(data.importantDates)
        ? data.importantDates
            .filter((d) => d && d.label && this.parseValidDate(d.date))
            .map((d) => ({ label: String(d.label).trim(), date: new Date(d.date) }))
        : [],
      entities: Array.isArray(data.entities)
        ? data.entities
            .filter((e) => e && e.name)
            .map((e) => ({ name: String(e.name).trim(), type: String(e.type || 'Entity').trim() }))
        : [],
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim().toLowerCase())
        : [],
      confidence: typeof data.confidence === 'number' && data.confidence >= 0 && data.confidence <= 1
        ? Number(data.confidence.toFixed(2))
        : 0.85
    };

    return sanitized;
  }

  parseValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return null;
    // Discard absurd dates (before 1950 or beyond 2100)
    const year = parsed.getFullYear();
    if (year < 1950 || year > 2100) return null;
    return parsed;
  }

  /**
   * Deterministic heuristic fallback when Gemini API is unavailable or offline
   */
  heuristicFallback(text = '', originalFileName = '') {
    const lowerText = (text + ' ' + originalFileName).toLowerCase();
    const cleanFileName = originalFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    let category = 'other';
    let documentType = 'Document';
    const tags = [];

    // Category and Document Type detection patterns
    if (/(warranty|guarantee|coverage period)/i.test(lowerText)) {
      category = 'warranty';
      documentType = 'Warranty Certificate';
      tags.push('warranty');
    } else if (/(invoice|receipt|tax invoice|order confirmation|payment receipt)/i.test(lowerText)) {
      category = 'receipts';
      documentType = 'Receipt / Invoice';
      tags.push('receipt');
    } else if (/(bill|electricity|water|utility|statement balance|amount due)/i.test(lowerText)) {
      category = 'bills';
      documentType = 'Utility Bill';
      tags.push('bill', 'utilities');
    } else if (/(insurance|policy|premium|coverage|beneficiary)/i.test(lowerText)) {
      category = 'insurance';
      documentType = 'Insurance Policy';
      tags.push('insurance');
    } else if (/(passport|driver'?s license|national id|identification|ssn|voter)/i.test(lowerText)) {
      category = 'identity';
      documentType = 'Identity Document';
      tags.push('identity', 'official');
    } else if (/(degree|diploma|university|graduation|transcript|certificate of)/i.test(lowerText)) {
      category = 'education';
      documentType = 'Educational Certificate';
      tags.push('education', 'academic');
    } else if (/(medical|hospital|prescription|doctor|clinical|diagnosis|patient)/i.test(lowerText)) {
      category = 'medical';
      documentType = 'Medical Record';
      tags.push('medical', 'health');
    } else if (/(employment|offer letter|agreement|salary|contract|nda)/i.test(lowerText)) {
      category = 'employment';
      documentType = 'Employment Document';
      tags.push('employment', 'career');
    } else if (/(ticket|boarding pass|visa|itinerary|hotel reservation)/i.test(lowerText)) {
      category = 'travel';
      documentType = 'Travel Document';
      tags.push('travel');
    }

    // Issuer heuristic
    let issuer = null;
    const issuerMatch = text.match(/(?:Issued by|Company|Organization|Issuer|Provider|Bank|Hospital):\s*([A-Za-z0-9&., -]{3,40})/i);
    if (issuerMatch && issuerMatch[1]) {
      issuer = issuerMatch[1].trim();
      tags.push(issuer.toLowerCase());
    }

    // Expiry date heuristic (search for "expiry", "valid until", "expires", "due date")
    let expiryDate = null;
    const expiryMatch = text.match(/(?:expir(?:y|es|ation)|valid(?:ity)? (?:until|thru|through)|due date)[:\s]+([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})/i);
    if (expiryMatch && expiryMatch[1]) {
      const parsed = new Date(expiryMatch[1]);
      if (!isNaN(parsed.getTime())) {
        expiryDate = parsed;
      }
    }

    // Summary generation
    let summary = `Document: ${cleanFileName}.`;
    if (text && text.trim().length > 30) {
      const snippet = text.replace(/\s+/g, ' ').substring(0, 180).trim();
      summary = `${documentType} categorized under ${category}. Preview: "${snippet}..."`;
    }

    return {
      documentType,
      category,
      title: cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1),
      summary,
      issuer,
      documentDate: new Date(),
      expiryDate,
      importantDates: expiryDate ? [{ label: 'Detected Expiry Date', date: expiryDate }] : [],
      entities: issuer ? [{ name: issuer, type: 'Organization' }] : [],
      tags: Array.from(new Set(tags)),
      confidence: text && text.trim().length > 20 ? 0.72 : 0.50
    };
  }
}

module.exports = new GeminiService();
