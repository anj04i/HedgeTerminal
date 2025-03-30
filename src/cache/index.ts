import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import logger from '../utils/logger';

export const CACHE_KEYS = {
  fundFilings: (identifier: string) => `fund:${identifier}:filings`,
  fundStats: (identifier: string) => `fund:${identifier}:stats`,
  fundCompleteMetrics: (identifier: string) => `fund:${identifier}:metrics`,
  fundVolatility: (identifier: string) => `fund:${identifier}:volatility`,
  fundPurchases: (identifier: string) => `fund:${identifier}:purchases`,
  fundClassDistribution: (identifier: string) =>
    `fund:${identifier}:class-dist`,
  fundTopHoldings: (identifier: string, limit: number) =>
    `fund:${identifier}:top-holdings:${limit}`,
  popularHoldings: (limit: number) => `holdings:popular:${limit}`,
  similarFunds: (cik: string, limit: number) => `fund:${cik}:similar:${limit}`,
  topPerformingFunds: (limit: number) => `funds:top-performing:${limit}`,
  mostUniqueFunds: (limit: number) => `funds:most-unique:${limit}`,
};

const REDIS_URL = Bun.env.REDIS_URL || process.env.REDIS_URL;

const keyvRedis = new KeyvRedis(REDIS_URL);

const cache = new Keyv({
  store: keyvRedis,
  ttl: 300000, // 5 minutes
  namespace: 'funds',
});

cache.on('error', (err) => logger.error('Redis Connection Error:', err));

export { cache };

logger.info('Starting application with Redis cache enabled');

logger.info(
  'Initializing Redis cache connection:',
  REDIS_URL ? 'Redis URL configured' : 'No Redis URL found',
);
