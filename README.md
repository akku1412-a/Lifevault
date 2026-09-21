# LifeVault – Smart Personal Document Organizer

> **A secure personal document management platform that empowers users to upload, organize, search, analyze, summarize, and track critical personal documents.**

LifeVault combines modern cryptography, cloud storage abstractions, PDF text extraction, OCR, Google Gemini AI intelligence, automated expiry tracking, and a sleek SaaS interface.

---

## Key Features

- **End-to-End Tenant Isolation & Zero-Trust Security**: Every document, category, reminder, and activity record is strictly scoped to the authenticated user's ID. Prevents IDOR and cross-user data exposure.
- **Binary Signature & Magic-Byte Validation**: Validates genuine binary magic numbers for PDF, PNG, JPG, JPEG, and WEBP files. Prevents disguised executables and malicious scripts.
- **SHA-256 Cryptographic Deduplication**: Calculates file hashes upon upload to immediately flag and prevent duplicate document uploads per user.
- **Dual Text Extraction Engine**:
  - **PDF Parser**: High-performance native PDF stream extraction.
  - **Tesseract OCR**: Neural optical character recognition for scanned invoices, receipts, and photos.
- **Google Gemini AI Intelligence**:
  - Automatically identifies document type (Warranty, Policy, Certificate, Bill, ID).
  - Categorizes records into predefined and custom categories.
  - Extracts issuing vendors (e.g., Apple, Samsung, Geico, State DMV).
  - Detects effective dates and expiry deadlines.
  - Generates concise 2-3 sentence executive summaries.
  - Hallucination suppression with strict schema validation and offline heuristic fallbacks.
- **Proactive Expiry & Deadline Tracking**:
  - Automatic status transitions: `no_expiry`, `active`, `expiring_soon` (within 30 days), and `expired`.
  - Grouped views for records expiring in 7 days, 30 days, or past due.
- **Automated In-App Reminders & Notifications**:
  - Multi-stage scheduled reminder alerts (30d, 7d, 1d before expiration).
  - Background scheduler automatically creates actionable notifications.
  - Interactive notification bell with unread counters and quick mark-as-read controls.
- **Intelligent Full-Text & Metadata Search**:
  - Search across document titles, vendor issuers, smart tags, OCR extracted text, and AI summaries with instant debouncing.
- **Storage Layer Abstraction**:
  - Pluggable driver architecture supporting `LocalStorageAdapter` for zero-configuration local development and `S3StorageAdapter` for AWS S3, Cloudflare R2, MinIO, or Google Cloud Storage.
- **Security Audit Trail**:
  - Audits important actions (Upload, View, Download, Update, Delete, AI Process, Reprocess) with IP address and User-Agent logging.

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   React + Vite Frontend   │
                          │ (Tailwind CSS, Lucide UI) │
                          └─────────────┬─────────────┘
                                        │ REST API (Bearer JWT)
                                        ▼
                          ┌───────────────────────────┐
                          │   Node.js / Express API   │
                          │ (Helmet, Cors, RateLimit) │
                          └──────┬───────────┬────────┘
                                 │           │
          ┌──────────────────────┘           └──────────────────────┐
          ▼                                                         ▼
┌──────────────────┐                                      ┌──────────────────┐
│ MongoDB Database │                                      │ Storage Adapter  │
│ (Mongoose ODM)   │                                      │ (Local Disk / S3)│
└──────────────────┘                                      └──────────────────┘
          ▲                                                         ▲
          │                                                         │
          └──────────────────────┬──────────────────────────────────┘
                                 │ Buffer Pipeline
                                 ▼
                     ┌───────────────────────┐
                     │ Text Extraction (OCR) │
                     │  (PDF-Parse / Tesseract)
                     └───────────┬───────────┘
                                 │ Cleaned Text
                                 ▼
                     ┌───────────────────────┐
                     │  Google Gemini Engine │
                     │  (Structured Schema)  │
                     └───────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (Dark theme, Glassmorphism, custom design tokens)
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT request & response interceptors

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Zero-Config Local Fallback**: `mongodb-memory-server` automatically boots if no external MongoDB instance is running
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` (salt rounds = 12)
- **File Upload**: Multer (Memory Storage) with binary magic byte validation
- **PDF Text Parsing**: `pdf-parse`
- **OCR Engine**: `tesseract.js`
- **AI Engine**: `@google/generative-ai` (Gemini 1.5 Flash)
- **Security**: Helmet, CORS, Express Rate Limit, Gzip Compression

---

## Project Structure

```
lifevault/
├── client/                               # Frontend Application
│   ├── public/
│   │   └── logo.svg                      # LifeVault Shield Logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/AIInsightCard.jsx      # AI Summary & Confidence score card
│   │   │   ├── common/                   # Button, Input, Modal, Badge, Skeleton
│   │   │   ├── documents/                # DocumentCard, DocumentTable, UploadZone
│   │   │   └── layout/                   # Sidebar, TopNav, AppLayout
│   │   ├── context/                      # AuthContext, NotificationContext
│   │   ├── pages/                        # Landing, Login, Register, Dashboard, Documents, etc.
│   │   ├── services/api.js               # Centralized Axios client & REST endpoints
│   │   ├── utils/                        # formatters, constants
│   │   ├── App.jsx                       # Route configuration & ProtectedRoute guards
│   │   ├── main.jsx                      # Application entrypoint
│   │   └── index.css                     # Tailwind CSS & glassmorphic tokens
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                               # Backend REST API
│   ├── src/
│   │   ├── config/                       # db.js, env.js
│   │   ├── controllers/                  # auth, document, category, reminder, notification, audit
│   │   ├── middleware/                   # authGuard, upload, errorHandler, rateLimiter
│   │   ├── models/                       # User, Document, Category, Reminder, Notification, AuditLog
│   │   ├── routes/                       # Express route modules
│   │   ├── services/                     # documentService, storageService, ocrService, geminiService
│   │   ├── utils/                        # apiResponse, logger, textNormalizer
│   │   └── app.js                        # Express server entrypoint
│   ├── tests/                            # Jest & Supertest automated test suites
│   │   ├── auth.test.js
│   │   ├── security.test.js
│   │   └── ai_validator.test.js
│   ├── uploads/                          # Local storage driver destination (git-ignored)
│   ├── .env.example
│   └── package.json
│
├── .env.example                          # Root environment template
├── package.json                          # Monorepo concurrency scripts
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v20.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 1. Installation

Clone the repository and install all dependencies:

```bash
# Clone the repository
git clone <repo-url>
cd lifevault

# Install all dependencies across root, server, and client
npm run install:all
```

### 2. Environment Configuration

Copy the sample environment file in `server/`:

```bash
cp server/.env.example server/.env
```

**Key Environment Variables (`server/.env`):**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
# If left empty in development, an embedded MongoMemoryServer will start automatically!
MONGODB_URI=

# Security
JWT_SECRET=super_secret_lifevault_jwt_key_change_in_production_32chars!
JWT_EXPIRES_IN=7d

# Google Gemini API (Optional)
# Get your API key from Google AI Studio: https://aistudio.google.com/
# If left empty, LifeVault seamlessly operates in deterministic heuristic extraction mode.
GEMINI_API_KEY=

# Storage Driver ('local' or 's3')
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads

# S3 / Cloud Storage Settings (Optional - only if STORAGE_DRIVER=s3)
CLOUD_STORAGE_BUCKET=
CLOUD_STORAGE_REGION=us-east-1
CLOUD_STORAGE_ACCESS_KEY=
CLOUD_STORAGE_SECRET_KEY=
```

---

## Running the Application

### Development Mode (Concurrent)

Start both backend server (`http://localhost:5000`) and frontend Vite client (`http://localhost:5173`) with a single command:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

### One-Click Demo Access
When visiting `http://localhost:5173/login`, click the **"Fill & Enter"** button in the *One-Click Demo Access* card to instantly enter with pre-seeded demo credentials (`demo@lifevault.local`).

---

## Automated Testing

LifeVault includes comprehensive integration tests covering user authentication, multi-tenant isolation, file upload validation, and AI response sanitization.

Run the test suite:

```bash
cd server && npm test
```

Test coverage includes:
- **`tests/auth.test.js`**: User registration, login, JWT validation, duplicate email prevention, password hashing.
- **`tests/security.test.js`**: Cross-tenant document isolation (verifying User B cannot view, download, update, or delete User A's document), binary signature mismatch rejection, and SHA-256 duplicate upload prevention.
- **`tests/ai_validator.test.js`**: Gemini schema validation, hallucination suppression, heuristic fallback extraction, and expiry status boundary calculations.

---

## REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `POST` | `/api/auth/logout` | Invalidate current session | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & quota | Yes |
| `PATCH` | `/api/auth/profile` | Update user name or change password | Yes |
| `POST` | `/api/documents` | Multipart document upload with magic byte check | Yes |
| `GET` | `/api/documents` | Paginated documents with category/status filters | Yes |
| `GET` | `/api/documents/:id` | Fetch document detail and AI metadata | Yes |
| `PATCH` | `/api/documents/:id` | Update metadata, tags, dates, or archive | Yes |
| `DELETE` | `/api/documents/:id` | Permanently delete document & physical file | Yes |
| `GET` | `/api/documents/:id/preview` | Stream file for inline browser rendering | Yes |
| `GET` | `/api/documents/:id/download`| Download original file with Content-Disposition | Yes |
| `POST` | `/api/documents/:id/reprocess`| Trigger fresh OCR extraction and AI analysis | Yes |
| `GET` | `/api/documents/search` | Full-text and keyword search endpoint | Yes |
| `GET` | `/api/documents/expiring` | Retrieve expiring and expired documents | Yes |
| `GET` | `/api/documents/stats` | Aggregated dashboard metrics | Yes |
| `GET` | `/api/categories` | List system & user categories with counts | Yes |
| `POST` | `/api/categories` | Create custom user category | Yes |
| `DELETE`| `/api/categories/:id` | Delete custom category | Yes |
| `GET` | `/api/reminders` | Retrieve scheduled document reminders | Yes |
| `POST` | `/api/reminders` | Schedule reminder tied to a document | Yes |
| `PATCH` | `/api/reminders/:id` | Update status (dismiss/reactivate) | Yes |
| `DELETE`| `/api/reminders/:id` | Remove reminder | Yes |
| `GET` | `/api/notifications` | List user notifications & unread count | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark individual notification as read | Yes |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications as read | Yes |
| `GET` | `/api/audit-logs` | Retrieve chronological security audit trail | Yes |

---

## Security Best Practices Implemented

1. **Strict User Scoping**: All database queries for documents, categories, reminders, and notifications require `userId: req.user._id`. Attempts to access another user's ID return `404 Not Found` without disclosing record existence.
2. **Binary Signature Verification**: Examines the raw buffer headers to verify magic bytes (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`, `RIFF...WEBP`) before saving.
3. **Password Security**: Passwords hashed with `bcryptjs` using 12 salt rounds. Plaintext passwords never stored.
4. **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on `/api/auth` (30 reqs/15m) and protects all general `/api` routes (300 reqs/15m).
5. **Safe Error Handling**: Internal stack traces suppressed in production; clean error JSON contracts returned.

---

## Future Roadmap

- **Vector Semantic Search**: Integrate embeddings (e.g. Gemini `text-embedding-004`) for natural language semantic query matching.
- **Multi-Factor Authentication (MFA)**: TOTP authenticator integration for enhanced vault security.
- **Direct Email / SMS Alerts**: Webhook or SendGrid/Twilio integrations for outbound reminder delivery.
- **Family / Team Vault Sharing**: Granular role-based document sharing with view-only or edit permissions.

---

## License

MIT © LifeVault
