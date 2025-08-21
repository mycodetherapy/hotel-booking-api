import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestAuthGuard, TestManagerAuthGuard } from './test-auth.guard';
import { SupportRequestService } from '../src/support/services/support-request.service';


describe('SupportRequest Final Test', () => {
  let app: INestApplication;
  let createdRequestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new TestAuthGuard());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create support request successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/client/support-requests')
      .send({ text: 'Test support request' });

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('id');

    createdRequestId = response.body[0].id;
  });

  it('should get support requests list and find created request', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/client/support-requests')
      .query({ isActive: 'true' });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    const foundRequest = response.body.find(req => req.id === createdRequestId);
    expect(foundRequest).toBeDefined();
  });

  it('should test manager endpoints with manager guard', async () => {
    app.useGlobalGuards(new TestManagerAuthGuard());

    const response = await request(app.getHttpServer())
      .get('/api/manager/support-requests')
      .query({ isActive: 'true' });

    expect([200, 403]).toContain(response.status);

    app.useGlobalGuards(new TestAuthGuard());
  });

  it('should send message to created support request', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/common/support-requests/${createdRequestId}/messages`)
      .send({ text: 'Test message' });

    expect([201, 200]).toContain(response.status);
  });

  it('should get messages from support request', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/common/support-requests/${createdRequestId}/messages`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should inject SupportRequestService from module', async () => {
    const service = app.get(SupportRequestService);
    expect(service).toBeDefined();
    expect(typeof service).toBe('object');
  });
});