import { upsert13FRecords } from "../db";
import { EdgarManager } from "../lib/manager";
import logger from "../utils/logger";
import { Fund, funds } from "./config";

export async function syncFunds13F(funds: Fund[]): Promise<void> {
  logger.info(`Starting 13F sync for ${funds.length} funds`);
  for (const fund of funds) {
    try {
      const edgar = new EdgarManager(fund.cik);
      const history = await edgar.get13FHistory();
      await upsert13FRecords(fund.cik, fund.name, history);
      logger.info(`Successfully processed ${fund.name}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      logger.error(`Failed to process fund ${fund.name} (${fund.cik}): ${err}`);
      continue;
    }
  }
  logger.info("Completed 13F sync for all funds");
}

syncFunds13F(funds);
