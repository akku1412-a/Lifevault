const request = require('supertest');
const { app } = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const User = require('../src/models/User');
const Document = require('../src/models/Document');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Document.deleteMany({});
});

describe('Cross-User Data Isolation & Security', () => {
  let userAToken;
  let userBToken;
  let userADocId;

  // Minimal valid PDF buffer: starts with %PDF-1.4
  const samplePdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');

  beforeEach(async () => {
    // 1. Create User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User Alpha',
      email: 'alpha@test.com',
      password: 'Password123!'
    });
    userAToken = resA.body.data.token;

    // 2. Create User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User Beta',
      email: 'beta@test.com',
      password: 'Password123!'
    });
    userBToken = resB.body.data.token;

    // 3. User A uploads a document
    const uploadRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', samplePdfBuffer, 'confidential_medical.pdf');

    expect(uploadRes.status).toBe(201);
    userADocId = uploadRes.body.data.document._id;
  });

  it('should STRICTLY FORBID User B from reading User A document', async () => {
    const res = await request(app)
      .get(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Must return 404 Not Found to avoid leaking document existence
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should STRICTLY FORBID User B from updating User A document', async () => {
    const res = await request(app)
      .patch(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(404);
  });

  it('should STRICTLY FORBID User B from deleting User A document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);

    // Verify document still safely exists for User A
    const verifyRes = await request(app)
      .get(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(verifyRes.status).toBe(200);
  });

  it('should reject file upload with fake extension and mismatching binary signature', async () => {
    const fakeFileBuffer = Buffer.from('console.log("I am actually JavaScript, not a PDF!");');

    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', fakeFileBuffer, 'malicious.pdf');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('FILE_SIGNATURE_MISMATCH');
  });

  it('should prevent duplicate upload of the exact same document for the same user', async () => {
    const duplicateRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', samplePdfBuffer, 'confidential_medical_copy.pdf');

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.code).toBe('DUPLICATE_DOCUMENT');
  });
});
