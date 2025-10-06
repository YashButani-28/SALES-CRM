import { describe, expect, it, beforeAll, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const createToken = (role = 'Admin') =>
  jwt.sign(
    {
      id: 'user-1',
      email: `${role.toLowerCase()}@example.com`,
      role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

describe('CustomFields API', () => {
  beforeAll(async () => {
    await prisma.customFieldValue.deleteMany();
    await prisma.customField.deleteMany();
  });

  afterEach(async () => {
    await prisma.customFieldValue.deleteMany();
    await prisma.customField.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects non-admin users', async () => {
    const token = createToken('Sales');
    const response = await request(app)
      .post('/api/custom-fields')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entity: 'Lead',
        fieldType: 'Text',
        label: 'Test',
        key: 'test_field',
        required: true,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('allows admin to create and fetch custom fields', async () => {
    const token = createToken('Admin');
    const createRes = await request(app)
      .post('/api/custom-fields')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entity: 'Lead',
        fieldType: 'Text',
        label: 'Company Name',
        key: 'company_name',
        required: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/custom-fields?entity=Lead')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data).toHaveLength(1);
    expect(getRes.body.data[0].label).toBe('Company Name');
  });
});
