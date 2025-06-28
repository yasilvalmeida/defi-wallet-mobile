import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                port: 3000,
                'cors.origin': 'http://localhost:8081',
                'blockchain.solana.rpcUrl':
                  'https://api.mainnet-beta.solana.com',
                'blockchain.ethereum.rpcUrl':
                  'https://mainnet.infura.io/v3/test',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthStatus', () => {
    it('should return basic health status', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const result = await service.getHealthStatus();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('environment', 'test');

      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use default environment when NODE_ENV is not set', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const result = await service.getHealthStatus();

      expect(result.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getDetailedHealthStatus', () => {
    it('should return detailed health status with all dependencies healthy', async () => {
      const result = await service.getDetailedHealthStatus();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('dependencies');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');

      // Check dependencies
      expect(Array.isArray(result.dependencies)).toBe(true);
      expect(result.dependencies).toHaveLength(3);

      const dependencyNames = result.dependencies.map((dep) => dep.name);
      expect(dependencyNames).toContain('redis');
      expect(dependencyNames).toContain('solana_rpc');
      expect(dependencyNames).toContain('ethereum_rpc');

      // All dependencies should be healthy in mock environment
      result.dependencies.forEach((dep) => {
        expect(dep.status).toBe('healthy');
        expect(dep).toHaveProperty('responseTime');
        expect(dep).toHaveProperty('details');
      });

      // Check memory info
      expect(result.memory).toHaveProperty('used');
      expect(result.memory).toHaveProperty('total');
      expect(result.memory).toHaveProperty('external');
      expect(typeof result.memory.used).toBe('number');
      expect(typeof result.memory.total).toBe('number');
      expect(typeof result.memory.external).toBe('number');

      // Check CPU info
      expect(result.cpu).toHaveProperty('user');
      expect(result.cpu).toHaveProperty('system');
      expect(typeof result.cpu.user).toBe('number');
      expect(typeof result.cpu.system).toBe('number');
    });

    it('should return degraded status when dependencies are unhealthy', async () => {
      // Mock one of the dependency checks to fail
      const mockCheckRedis = jest
        .spyOn(service as any, 'checkRedis')
        .mockResolvedValue({
          name: 'redis',
          status: 'unhealthy',
          error: 'Connection failed',
          details: 'Failed to connect to Redis',
        });

      const result = await service.getDetailedHealthStatus();

      expect(result.status).toBe('degraded');

      const redisDependency = result.dependencies.find(
        (dep) => dep.name === 'redis'
      );
      expect(redisDependency.status).toBe('unhealthy');
      expect(redisDependency).toHaveProperty('error', 'Connection failed');

      mockCheckRedis.mockRestore();
    });
  });

  describe('dependency checks', () => {
    it('should check Redis dependency', async () => {
      const checkRedis = (service as any).checkRedis.bind(service);
      const result = await checkRedis();

      expect(result).toHaveProperty('name', 'redis');
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('details');
      expect(typeof result.responseTime).toBe('number');
    });

    it('should check Solana RPC dependency', async () => {
      const checkSolanaRpc = (service as any).checkSolanaRpc.bind(service);
      const result = await checkSolanaRpc();

      expect(result).toHaveProperty('name', 'solana_rpc');
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('details');
      expect(typeof result.responseTime).toBe('number');
    });

    it('should check Ethereum RPC dependency', async () => {
      const checkEthereumRpc = (service as any).checkEthereumRpc.bind(service);
      const result = await checkEthereumRpc();

      expect(result).toHaveProperty('name', 'ethereum_rpc');
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('details');
      expect(typeof result.responseTime).toBe('number');
    });
  });
});
