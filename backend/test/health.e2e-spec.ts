import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set global prefix
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('environment');
        
        expect(typeof res.body.timestamp).toBe('string');
        expect(typeof res.body.uptime).toBe('number');
        expect(typeof res.body.version).toBe('string');
        expect(typeof res.body.environment).toBe('string');
      });
  });

  it('/api/health/detailed (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health/detailed')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('environment');
        expect(res.body).toHaveProperty('dependencies');
        expect(res.body).toHaveProperty('memory');
        expect(res.body).toHaveProperty('cpu');
        
        expect(Array.isArray(res.body.dependencies)).toBe(true);
        expect(res.body.dependencies.length).toBeGreaterThan(0);
        
        // Check that each dependency has required properties
        res.body.dependencies.forEach((dep: any) => {
          expect(dep).toHaveProperty('name');
          expect(dep).toHaveProperty('status');
          expect(dep).toHaveProperty('details');
          expect(['healthy', 'unhealthy']).toContain(dep.status);
        });
        
        // Check memory properties
        expect(res.body.memory).toHaveProperty('used');
        expect(res.body.memory).toHaveProperty('total');
        expect(res.body.memory).toHaveProperty('external');
        expect(typeof res.body.memory.used).toBe('number');
        expect(typeof res.body.memory.total).toBe('number');
        expect(typeof res.body.memory.external).toBe('number');
        
        // Check CPU properties
        expect(res.body.cpu).toHaveProperty('user');
        expect(res.body.cpu).toHaveProperty('system');
        expect(typeof res.body.cpu.user).toBe('number');
        expect(typeof res.body.cpu.system).toBe('number');
      });
  });

  it('should return 404 for non-existent health endpoint', () => {
    return request(app.getHttpServer())
      .get('/api/health/nonexistent')
      .expect(404);
  });
}); 