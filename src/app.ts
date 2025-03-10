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

    const filings = await getFundFilings(identifier);

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
    const stats = await getFundStats(identifier);
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
    const volatility = await getFundVolatility(identifier);
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
    const purchases = await getFundPurchases(identifier);
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
    const distribution = await getFundClassDistribution(identifier);
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
    const holdings = await getFundTopHoldings(identifier, limit);
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
    const holdings = await getMostPopularHoldings(limit);
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
