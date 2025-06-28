export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    },
  },
  blockchain: {
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      testnetUrl: process.env.SOLANA_TESTNET_URL || 'https://api.testnet.solana.com',
      devnetUrl: process.env.SOLANA_DEVNET_URL || 'https://api.devnet.solana.com',
    },
    ethereum: {
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      testnetUrl: process.env.ETHEREUM_TESTNET_URL || 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
      devnetUrl: process.env.ETHEREUM_DEVNET_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    },
  },
  apis: {
    jupiter: {
      baseUrl: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
    },
    zerox: {
      baseUrl: process.env.ZEROX_API_URL || 'https://api.0x.org',
      apiKey: process.env.ZEROX_API_KEY || '',
    },
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300,
    priceUpdateInterval: parseInt(process.env.PRICE_UPDATE_INTERVAL, 10) || 30000,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
    credentials: true,
  },
}); 