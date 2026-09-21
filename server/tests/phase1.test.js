const request = require('supertest');
const { app } = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Phase 1: Foundation, Security & Database Connectivity', () => {
  it('GET /api/health should return 200 with operational status and MongoDB connected', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.database.status).toBe('connected');
    expect(res.body.data.environment).toBeDefined();
  });

  it('GET /api/unhandled-route should return 404 with standardized error JSON', async () => {
    const res = await request(app).get('/api/unhandled-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.message).toContain('API route not found');
  });

  it('should include Helmet security headers in responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
