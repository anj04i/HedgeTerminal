import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getFundClassDistribution,
  getFundFilings,
  getFundPurchases,
  getFundStats,
  getFundTopHoldings,
  getFundVolatility,
  getMostPopularHoldings,
} from './db';
import logger from './utils/logger';
import { funds } from './scripts/config';
import { cache, CACHE_KEYS } from './cache';

const app = new Hono();

app.use('*', cors());

app.get('/health', async (c) => {
  return c.text('ok');
});

app.get('/api/config', async (c) => {
  return c.json(
    {
      funds: funds,
    },
    200,
  );
});

app.get('/api/funds/:identifier/filings', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Filings requested for fund: ${identifier}`);

  try {
    if (!identifier) {
      logger.warn('Request received with empty identifier');
      return c.json({ error: 'Fund identifier is required' }, 400);
    }

    const cacheKey = CACHE_KEYS.fundFilings(identifier);
    let filings = await cache.get(cacheKey);

    if (!filings) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      filings = await getFundFilings(identifier);

      if (filings.length) {
        await cache.set(cacheKey, filings);
        logger.info(
          `Stored ${filings.length} filings in cache for ${identifier}`,
        );
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!filings.length) {
      logger.info(`No filings found for fund: ${identifier}`);
      return c.json(
        {
          message: 'No filings found for this fund',
          filings: [],
        },
        404,
      );
    }

    logger.info(
      `Successfully retrieved ${filings.length} filings for ${identifier}`,
    );
    return c.json(
      {
        message: 'Filings retrieved successfully',
        filings: filings,
      },
      200,
    );
  } catch (error) {
    logger.error(`Error fetching fund filings for ${identifier}: ${error}`);
    return c.json(
      {
        error: 'Internal server error while fetching filings',
      },
      500,
    );
  }
});

app.get('/api/funds/:identifier/stats', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Stats requested for fund: ${identifier}`);
  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundStats(identifier);
    let stats = await cache.get(cacheKey);

    if (!stats) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      stats = await getFundStats(identifier);

      if (stats) {
        await cache.set(cacheKey, stats);
        logger.info(`Stored stats in cache for ${identifier}`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!stats) return c.json({ message: 'No filings found', stats: {} }, 404);

    return c.json({ message: 'Stats retrieved', stats }, 200);
  } catch (error) {
    logger.error(`Error fetching stats for ${identifier}: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/funds/:identifier/volatility', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Volatility requested for fund: ${identifier}`);
  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundVolatility(identifier);
    let volatility = await cache.get(cacheKey);

    if (!volatility) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      volatility = await getFundVolatility(identifier);

      await cache.set(cacheKey, volatility);
      logger.info(`Stored volatility in cache for ${identifier}`);
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    return c.json({ message: 'Volatility retrieved', volatility }, 200);
  } catch (error) {
    logger.error(`Error fetching volatility for ${identifier}: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/funds/:identifier/purchases', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Purchases requested for fund: ${identifier}`);

  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundPurchases(identifier);
    let purchases = await cache.get(cacheKey);

    if (!purchases) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      purchases = await getFundPurchases(identifier);

      if (purchases.length) {
        await cache.set(cacheKey, purchases);
        logger.info(
          `Stored ${purchases.length} purchases in cache for ${identifier}`,
        );
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!purchases.length) {
      logger.info(`No purchases found for ${identifier}`);
      return c.json({ message: 'No purchases found', purchases: [] }, 404);
    }

    logger.info(
      `Successfully retrieved ${purchases.length} purchases for ${identifier}`,
    );
    return c.json({ message: 'Purchases retrieved', purchases }, 200);
  } catch (error) {
    logger.error(`Error fetching purchases for ${identifier}: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/funds/:identifier/class-distribution', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Class distribution requested for fund: ${identifier}`);

  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundClassDistribution(identifier);
    let distribution = await cache.get(cacheKey);

    if (!distribution) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      distribution = await getFundClassDistribution(identifier);

      if (distribution.length) {
        await cache.set(cacheKey, distribution);
        logger.info(`Stored class distribution in cache for ${identifier}`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!distribution.length) {
      logger.info(`No class distribution found for ${identifier}`);
      return c.json(
        { message: 'No class distribution found', distribution: [] },
        404,
      );
    }

    logger.info(`Successfully retrieved class distribution for ${identifier}`);
    return c.json(
      { message: 'Class distribution retrieved', distribution },
      200,
    );
  } catch (error) {
    logger.error(
      `Error fetching class distribution for ${identifier}: ${error}`,
    );
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/funds/:identifier/top-holdings', async (c) => {
  const identifier = c.req.param('identifier');
  const limit = 50;
  logger.info(
    `Top holdings requested for fund: ${identifier} with limit: ${limit}`,
  );

  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundTopHoldings(identifier, limit);
    let holdings = await cache.get(cacheKey);

    if (!holdings) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      holdings = await getFundTopHoldings(identifier, limit);

      if (holdings.length) {
        await cache.set(cacheKey, holdings);
        logger.info(
          `Stored ${holdings.length} top holdings in cache for ${identifier}`,
        );
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!holdings.length) {
      logger.info(`No top holdings found for ${identifier}`);
      return c.json({ message: 'No top holdings found', holdings: [] }, 404);
    }

    logger.info(
      `Successfully retrieved ${holdings.length} top holdings for ${identifier}`,
    );
    return c.json({ message: 'Top holdings retrieved', holdings }, 200);
  } catch (error) {
    logger.error(`Error fetching top holdings for ${identifier}: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/holdings/popular', async (c) => {
  const limit = 50;
  logger.info(`Popular holdings requested with limit: ${limit}`);

  try {
    const cacheKey = CACHE_KEYS.popularHoldings(limit);
    let holdings = await cache.get(cacheKey);

    if (!holdings) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      holdings = await getMostPopularHoldings(limit);

      if (holdings.length) {
        await cache.set(cacheKey, holdings);
        logger.info(`Stored ${holdings.length} popular holdings in cache`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!holdings.length) {
      logger.info('No popular holdings found');
      return c.json(
        { message: 'No popular holdings found', holdings: [] },
        404,
      );
    }

    logger.info(`Successfully retrieved ${holdings.length} popular holdings`);
    return c.json({ message: 'Popular holdings retrieved', holdings }, 200);
  } catch (error) {
    logger.error(`Error fetching popular holdings: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
