import { upsert13FRecords, upsertLatestBuys } from '../db';
import { EdgarManager } from '../lib/manager';
import logger from '../utils/logger';
import { Fund, funds } from './config';

/**
 * Syncs 13F history for specified funds
 */
export async function sync13FHistory(fundList: Fund[]): Promise<void> {
  logger.info(`Starting 13F history sync for ${fundList.length} funds`);

  for (const fund of fundList) {
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
}

/**
 * Syncs latest buys for specified funds
 */
export async function syncLatestBuys(fundList: Fund[]): Promise<void> {
  logger.info(`Starting latest buys sync for ${fundList.length} funds`);

  for (const fund of fundList) {
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
}

/**
 * Syncs both 13F history and latest buys for specified funds
 */
export async function syncAllFunds(fundList: Fund[]): Promise<void> {
  logger.info(`Starting unified sync for ${fundList.length} funds`);

  // Step 1: Sync 13F history
  await sync13FHistory(fundList);

  // Delay between sync phases
  logger.info('Waiting 5 seconds before latest buys sync');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 2: Sync latest buys
  await syncLatestBuys(fundList);

  logger.info('Completed unified sync for all funds');
}

// Parse command line arguments
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  let operation = 'all'; // Default operation
  let selectedFunds = funds; // Default to all funds

  // Check for operation type
  if (args.includes('--13f')) {
    operation = '13f';
  } else if (args.includes('--latest-buys')) {
    operation = 'latest-buys';
  }

  // Check for specific funds
  const fundArg = args.find((arg) => arg.startsWith('--fund='));
  if (fundArg) {
    const fundName = fundArg.split('=')[1];
    if (fundName) {
      const fund = funds.find(
        (f) => f.name.toLowerCase() === fundName.toLowerCase(),
      );
      if (fund) {
        selectedFunds = [fund];
      } else {
        logger.warn(`Fund "${fundName}" not found. Using all funds.`);
      }
    }
  }

  return { operation, selectedFunds };
}

const { operation, selectedFunds } = parseCommandLineArgs();

(async () => {
  try {
    if (operation === '13f') {
      await sync13FHistory(selectedFunds);
    } else if (operation === 'latest-buys') {
      await syncLatestBuys(selectedFunds);
    } else {
      await syncAllFunds(selectedFunds);
    }
  } catch (error) {
    logger.error(`Sync operation failed: ${error}`);
    process.exit(1);
  }
})();
