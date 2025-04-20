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
  getFundCompleteMetrics,
  getSimilarFunds,
  getTopPerformingFunds,
  getMostUniqueFunds,
  refreshFundMetrics,
  getFundAllPayload,
} from './db';
import logger from './utils/logger';
import { funds } from './scripts/config';
import { CACHE_KEYS, cache } from './cache';
import compress from 'hono-compress';

const app = new Hono();

app.use('*', cors());

app.use(
  '/api/*',
  compress({
    encodings: ['gzip', 'br'], // Prefer gzip for speed
    threshold: 10240, // Only compress responses >10KB
    brotliLevel: 2, // Lower brotli compression level (faster)
    gzipLevel: 4, // Moderate gzip compression level
  }),
);

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

app.get('/api/funds/:identifier/metrics', async (c) => {
  const identifier = c.req.param('identifier');
  logger.info(`Complete metrics requested for fund: ${identifier}`);
  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    const cacheKey = CACHE_KEYS.fundCompleteMetrics
      ? CACHE_KEYS.fundCompleteMetrics(identifier)
      : `fund:${identifier}:metrics`;
    let metrics = await cache.get(cacheKey);

    if (!metrics) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      metrics = await getFundCompleteMetrics(identifier);

      if (metrics && metrics.cik) {
        await cache.set(cacheKey, metrics);
        logger.info(`Stored complete metrics in cache for ${identifier}`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!metrics || !metrics.cik) {
      return c.json({ message: 'No metrics found', metrics: {} }, 404);
    }

    return c.json({ message: 'Metrics retrieved', metrics }, 200);
  } catch (error) {
    logger.error(`Error fetching complete metrics for ${identifier}: ${error}`);
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

app.get('/api/funds/:identifier/similar', async (c) => {
  const identifier = c.req.param('identifier');
  const limit = parseInt(c.req.query('limit') || '5', 10);
  logger.info(`Similar funds requested for ${identifier} with limit: ${limit}`);

  try {
    if (!identifier) return c.json({ error: 'Fund identifier required' }, 400);

    // For name-based lookups, we need to get the CIK first
    let cik = identifier;
    if (!/^\d+$/.test(identifier)) {
      const metrics = await getFundCompleteMetrics(identifier);
      if (!metrics || !metrics.cik) {
        return c.json({ message: 'Fund not found', similar: [] }, 404);
      }
      cik = metrics.cik;
    }

    const cacheKey = CACHE_KEYS.similarFunds
      ? CACHE_KEYS.similarFunds(cik, limit)
      : `fund:${cik}:similar:${limit}`;
    let similar = await cache.get(cacheKey);

    if (!similar) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      similar = await getSimilarFunds(cik, limit);

      if (similar.length) {
        await cache.set(cacheKey, similar);
        logger.info(
          `Stored ${similar.length} similar funds in cache for ${cik}`,
        );
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!similar.length) {
      logger.info(`No similar funds found for ${cik}`);
      return c.json({ message: 'No similar funds found', similar: [] }, 404);
    }

    logger.info(
      `Successfully retrieved ${similar.length} similar funds for ${cik}`,
    );
    return c.json({ message: 'Similar funds retrieved', similar }, 200);
  } catch (error) {
    logger.error(`Error fetching similar funds for ${identifier}: ${error}`);
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

app.get('/api/funds/top-performing', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  logger.info(`Top performing funds requested with limit: ${limit}`);

  try {
    const cacheKey = CACHE_KEYS.topPerformingFunds
      ? CACHE_KEYS.topPerformingFunds(limit)
      : `funds:top-performing:${limit}`;
    let funds = await cache.get(cacheKey);

    if (!funds) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      funds = await getTopPerformingFunds(limit);

      if (funds.length) {
        await cache.set(cacheKey, funds);
        logger.info(`Stored ${funds.length} top performing funds in cache`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!funds.length) {
      logger.info('No top performing funds found');
      return c.json(
        { message: 'No top performing funds found', funds: [] },
        404,
      );
    }

    logger.info(`Successfully retrieved ${funds.length} top performing funds`);
    return c.json({ message: 'Top performing funds retrieved', funds }, 200);
  } catch (error) {
    logger.error(`Error fetching top performing funds: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/funds/most-unique', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  logger.info(`Most unique funds requested with limit: ${limit}`);

  try {
    const cacheKey = CACHE_KEYS.mostUniqueFunds
      ? CACHE_KEYS.mostUniqueFunds(limit)
      : `funds:most-unique:${limit}`;
    let funds = await cache.get(cacheKey);

    if (!funds) {
      logger.info(`Cache miss for ${cacheKey}, fetching from database`);
      funds = await getMostUniqueFunds(limit);

      if (funds.length) {
        await cache.set(cacheKey, funds);
        logger.info(`Stored ${funds.length} most unique funds in cache`);
      }
    } else {
      logger.info(`Cache hit for ${cacheKey}, returning cached data`);
    }

    if (!funds.length) {
      logger.info('No unique funds found');
      return c.json({ message: 'No unique funds found', funds: [] }, 404);
    }

    logger.info(`Successfully retrieved ${funds.length} most unique funds`);
    return c.json({ message: 'Most unique funds retrieved', funds }, 200);
  } catch (error) {
    logger.error(`Error fetching most unique funds: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/refresh-metrics', async (c) => {
  try {
    logger.info('Refreshing fund metrics materialized view');
    await refreshFundMetrics();
    return c.json({ message: 'Fund metrics refreshed successfully' }, 200);
  } catch (error) {
    logger.error(`Error refreshing fund metrics: ${error}`);
    return c.json({ error: 'Failed to refresh fund metrics' }, 500);
  }
});

app.get('/api/funds/:cik/all', async (c) => {
  const cik = c.req.param('cik');
  if (!/^\d+$/.test(cik)) return c.json({ error: 'Valid CIK required' }, 400);

  const cacheKey = CACHE_KEYS.fundAll(cik);
  let json = await cache.get(cacheKey);

  if (!json) {
    json = await getFundAllPayload(cik);
    if (!json) return c.json({ error: 'Fund not found' }, 404);
    await cache.set(cacheKey, json, 300_000);
  }

  return c.json(json, 200);
});

export default app;
