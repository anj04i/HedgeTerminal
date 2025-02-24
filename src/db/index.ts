import { Extract13FRecord } from "../lib/types";
import logger from "../utils/logger";
import { pool } from "./config";

export async function upsert13FRecords(
  cik: string,
  name: string,
  records: Extract13FRecord[]
): Promise<void> {
  const valuesList: any[] = [];
  const valuePlaceholders: string[] = [];
  let parameterCount = 1;

  for (const record of records) {
    valuesList.push(
      cik,
      name,
      record.accessionNumber,
      record.filingDate,
      record.reportDate,
      record.totalValue
    );

    valuePlaceholders.push(
      `($${parameterCount}, $${parameterCount + 1}, $${parameterCount + 2}, $${
        parameterCount + 3
      }, $${parameterCount + 4}, $${parameterCount + 5})`
    );

    parameterCount += 6;
  }

  const client = await pool.connect();
  logger.info(`Upserting ${records.length} filings for ${name} (CIK: ${cik})`);

  try {
    await client.query("BEGIN");

    if (valuesList.length > 0) {
      const query = `
            INSERT INTO FILINGS (
              cik, name, accession_number, filing_date, report_date, total_value
            ) VALUES ${valuePlaceholders.join(", ")}
            ON CONFLICT (cik, accession_number) DO UPDATE SET
              name = EXCLUDED.name,
              filing_date = EXCLUDED.filing_date,
              report_date = EXCLUDED.report_date,
              total_value = EXCLUDED.total_value`;

      await client.query(query, valuesList);
    }
    await client.query("COMMIT");
    logger.info(`Successfully upserted ${records.length} filings for ${name}`);
  } catch (err) {
    logger.error(`Failed to upsert filings for ${name}: ${err}`);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getFundFilings(identifier: string): Promise<any[]> {
  logger.info(`Fetching filings for identifier: ${identifier}`);
  const isCIK = /^\d+$/.test(identifier);

  const query = `
  SELECT 
    cik,
    CONCAT('Q', EXTRACT(QUARTER FROM report_date), ' ', EXTRACT(YEAR FROM report_date)) as quarter,
    ROUND(total_value::numeric, 2) as value_usd
  FROM FILINGS 
  WHERE ${isCIK ? "cik = $1" : "LOWER(name) LIKE LOWER($1)"}
  ORDER BY report_date
`;

  const params = [isCIK ? identifier : `%${identifier}%`];

  try {
    const result = await pool.query(query, params);
    logger.info(`Retrieved ${result.rows.length} filings for ${identifier}`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching fund filings for ${identifier}: ${err}`);
    throw err;
  }
}
