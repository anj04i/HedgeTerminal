import { upsert13FRecords, upsertLatestBuys } from '../db';
import { EdgarManager } from '../lib/manager';
import logger from '../utils/logger';
import { Fund, funds } from './config';

export async function syncAllFunds(funds: Fund[]): Promise<void> {
  logger.info(`Starting unified sync for ${funds.length} funds`);

  // Step 1: Sync 13F history
  logger.info('Starting 13F history sync');
  for (const fund of funds) {
    try {
      const edgar = new EdgarManager(fund.cik);
      const history = await edgar.get13FHistory();
      await upsert13FRecords(fund.cik, fund.name, history);
      logger.info(`Successfully processed 13F history for ${fund.name}`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    } catch (err) {
      logger.error(
        `Failed to process 13F history for ${fund.name} (${fund.cik}): ${err}`,
      );
      continue;
    }
  }
  logger.info('Completed 13F history sync');

  // Delay between sync phases
  logger.info('Waiting 5 seconds before latest buys sync');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 2: Sync latest buys
  logger.info('Starting latest buys sync');
  for (const fund of funds) {
    try {
      const edgar = new EdgarManager(fund.cik);
      const latestResult = await edgar.getLatestBuys();
      if (latestResult.success) {
        await upsertLatestBuys(fund.cik, fund.name, latestResult.data);
      } else {
        logger.error(
          `Failed to get latest buys for ${fund.name} (${fund.cik}): ${latestResult.error}`,
        );
      }
      logger.info(`Successfully processed latest buys for ${fund.name}`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    } catch (err) {
      logger.error(
        `Failed to process latest buys for ${fund.name} (${fund.cik}): ${err}`,
      );
      continue;
    }
  }
  logger.info('Completed latest buys sync');

  logger.info('Completed unified sync for all funds');
}

syncAllFunds(funds);
