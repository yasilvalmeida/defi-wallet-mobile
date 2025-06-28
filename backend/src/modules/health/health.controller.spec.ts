import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ConfigService } from '@nestjs/config';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'port': 3000,
                'cors.origin': 'http://localhost:8081',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return basic health status', async () => {
      const mockHealthStatus = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 12345,
        version: '1.0.0',
        environment: 'test',
      };

      jest.spyOn(healthService, 'getHealthStatus').mockResolvedValue(mockHealthStatus);

      const result = await controller.getHealth();

      expect(result).toEqual(mockHealthStatus);
      expect(healthService.getHealthStatus).toHaveBeenCalled();
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health status', async () => {
      const mockDetailedHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 12345,
        version: '1.0.0',
        environment: 'test',
        dependencies: [
          {
            name: 'redis',
            status: 'healthy',
            responseTime: 5,
            details: 'Connected to Redis',
          },
          {
            name: 'solana_rpc',
            status: 'healthy',
            responseTime: 100,
            details: 'Solana RPC is responsive',
          },
          {
            name: 'ethereum_rpc',
            status: 'healthy',
            responseTime: 150,
            details: 'Ethereum RPC is responsive',
          },
        ],
        memory: {
          used: 50000000,
          total: 100000000,
          external: 1000000,
        },
        cpu: {
          user: 1000,
          system: 500,
        },
      };

      jest.spyOn(healthService, 'getDetailedHealthStatus').mockResolvedValue(mockDetailedHealth);

      const result = await controller.getDetailedHealth();

      expect(result).toEqual(mockDetailedHealth);
      expect(healthService.getDetailedHealthStatus).toHaveBeenCalled();
    });
  });
}); 