import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getFundFilings, getFundStats, getFundVolatility } from './db';
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

export default app;
