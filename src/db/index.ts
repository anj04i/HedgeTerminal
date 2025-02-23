import { Extract13FRecord } from "../lib/types";
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
      record.totalValue
    );

    valuePlaceholders.push(
      `($${parameterCount}, $${parameterCount + 1}, $${parameterCount + 2}, $${
        parameterCount + 3
      }, $${parameterCount + 4})`
    );
    parameterCount += 5;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (valuesList.length > 0) {
      const query = `
            INSERT INTO FILINGS (
              cik, name, accession_number, filing_date, total_value
            ) VALUES ${valuePlaceholders.join(", ")}
            ON CONFLICT (cik, accession_number) DO UPDATE SET
              name = EXCLUDED.name,
              filing_date = EXCLUDED.filing_date,
              total_value = EXCLUDED.total_value`;

      await client.query(query, valuesList);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
