import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { importFreshApp } from './test/helpers/http.js';

describe('server shared behavior', () => {
  it('serves root metadata, health, OpenAPI JSON, and favicon responses', async () => {
    const app = await importFreshApp();

    const root = await request(app).get('/').expect(200);
    expect(root.body).toMatchObject({
      name: 'SJBA API',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/v1',
        openapi: '/docs.json',
      },
    });

    const health = await request(app).get('/health').expect(200);
    expect(health.body).toMatchObject({
      status: 'healthy',
      environment: 'test',
    });
    expect(typeof (health.body as { timestamp: unknown }).timestamp).toBe('string');

    const docs = await request(app).get('/docs.json').expect(200);
    expect(docs.body).toMatchObject({
      openapi: expect.stringMatching(/^3\./),
      info: expect.objectContaining({ title: expect.any(String) }),
    });

    await request(app).get('/favicon.ico').expect(204);
    await request(app).get('/favicon.png').expect(204);
  });

  it('returns the public API version payload under /v1', async () => {
    const app = await importFreshApp();

    await request(app)
      .get('/v1')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          version: '1.0.0',
          documentation: '/docs',
        });
      });
  });

  it('maps unknown routes through the JSON 404 error handler', async () => {
    const app = await importFreshApp();

    await request(app)
      .get('/missing')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: {
            message: 'Not found - /missing',
            code: 'NOT_FOUND',
          },
        });
      });
  });

  it('maps blocked CORS origins through the error handler', async () => {
    const app = await importFreshApp();

    await request(app)
      .get('/health')
      .set('Origin', 'https://evil.example')
      .expect(403)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: {
            message: 'CORS policy violation',
            code: 'CORS_ERROR',
          },
        });
      });
  });

  it('rejects invalid referers on shared /v1 routes outside development', async () => {
    const app = await importFreshApp();

    await request(app)
      .get('/v1')
      .set('Referer', 'https://evil.example/page')
      .expect(403)
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: {
            message: 'Forbidden - Invalid referer',
            code: 'INVALID_REFERER',
          },
        });
      });
  });

  it('can force rate limiting for /v1 routes in tests', async () => {
    const app = await importFreshApp({ enableRateLimit: true });

    for (let requestCount = 0; requestCount < 100; requestCount += 1) {
      await request(app).get('/v1').expect(200);
    }

    await request(app)
      .get('/v1')
      .expect(429)
      .expect(({ body }) => {
        expect(body).toEqual({
          error: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      });
  });
});
