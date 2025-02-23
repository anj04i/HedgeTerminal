import { upsert13FRecords } from "../db";
import { EdgarManager } from "../lib/manager";
import { Fund, funds } from "./config";

export async function syncFunds13F(funds: Fund[]): Promise<void> {
  for (const fund of funds) {
    try {
      const edgar = new EdgarManager(fund.cik);
      const history = await edgar.get13FHistory();
      await upsert13FRecords(fund.cik, fund.name, history);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      console.error(`Failed to process fund ${fund.name} (${fund.cik}):`, err);
      continue;
    }
  }
}

syncFunds13F(funds);
