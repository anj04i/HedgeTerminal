import { Extract13FRecord, SEC13FHolding } from '../lib/types';
import logger from '../utils/logger';
import { pool } from './config';

export async function upsert13FRecords(
  cik: string,
  name: string,
  records: Extract13FRecord[],
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
      record.totalValue,
    );

    valuePlaceholders.push(
      `($${parameterCount}, $${parameterCount + 1}, $${parameterCount + 2}, $${
        parameterCount + 3
      }, $${parameterCount + 4}, $${parameterCount + 5})`,
    );

    parameterCount += 6;
  }

  const client = await pool.connect();
  logger.info(`Upserting ${records.length} filings for ${name} (CIK: ${cik})`);

  try {
    await client.query('BEGIN');

    if (valuesList.length > 0) {
      const query = `
            INSERT INTO FILINGS (
              cik, name, accession_number, filing_date, report_date, total_value
            ) VALUES ${valuePlaceholders.join(', ')}
            ON CONFLICT (cik, accession_number) DO UPDATE SET
              name = EXCLUDED.name,
              filing_date = EXCLUDED.filing_date,
              report_date = EXCLUDED.report_date,
              total_value = EXCLUDED.total_value`;

      await client.query(query, valuesList);
    }
    await client.query('COMMIT');
    logger.info(`Successfully upserted ${records.length} filings for ${name}`);
  } catch (err) {
    logger.error(`Failed to upsert filings for ${name}: ${err}`);
    await client.query('ROLLBACK');
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
    CONCAT(EXTRACT(YEAR FROM report_date), '-', EXTRACT(QUARTER FROM report_date)) as quarter,
    ROUND(total_value::numeric, 2) as value_usd
  FROM FILINGS
  WHERE ${isCIK ? 'cik = $1' : 'LOWER(name) LIKE LOWER($1)'}
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

export async function upsertLatestBuys(
  cik: string,
  name: string,
  holdings: SEC13FHolding[],
): Promise<void> {
  const valuesList: any[] = [];
  const valuePlaceholders: string[] = [];
  let parameterCount = 1;

  for (const holding of holdings) {
    valuesList.push(cik, name, holding.title, holding.class, holding.value);

    valuePlaceholders.push(
      `($${parameterCount}, $${parameterCount + 1}, $${parameterCount + 2}, $${
        parameterCount + 3
      }, $${parameterCount + 4})`,
    );

    parameterCount += 5;
  }

  const client = await pool.connect();
  logger.info(
    `Upserting ${holdings.length} holdings for ${name} (CIK: ${cik})`,
  );

  try {
    await client.query('BEGIN');

    if (valuesList.length > 0) {
      const query = `
        INSERT INTO HOLDINGS (
          cik, name, title, class, value
        ) VALUES ${valuePlaceholders.join(', ')}
        ON CONFLICT (cik, name, title, class) DO UPDATE SET
          value = EXCLUDED.value`;

      await client.query(query, valuesList);
    }
    await client.query('COMMIT');
    logger.info(
      `Successfully upserted ${holdings.length} holdings for ${name}`,
    );
  } catch (err) {
    logger.error(`Failed to upsert holdings for ${name}: ${err}`);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getFundStats(identifier: string): Promise<any> {
  const isCIK = /^\d+$/.test(identifier);

  const query = `
    SELECT
      aum,
      quarter,
      qoq_change,
      recent_trend AS yoy_growth,
      total_appreciation,
      volatility,
      max_growth,
      max_decline,
      growth_consistency
    FROM fund_stats
    WHERE ${isCIK ? 'cik = $1' : 'cik IN (SELECT cik FROM FILINGS WHERE LOWER(name) LIKE LOWER($1) LIMIT 1)'}
  `;

  const params = [isCIK ? identifier : `%${identifier}%`];

  try {
    const result = await pool.query(query, params);
    if (!result.rows.length) {
      return {
        aum: 0,
        quarter: '',
        qoq_change: '0',
        yoy_growth: 'N/A',
        total_appreciation: '0',
        volatility: '0',
        max_growth: '0',
        max_decline: '0',
        growth_consistency: '0',
      };
    }

    logger.info(`Retrieved stats for ${identifier}`);
    return result.rows[0];
  } catch (err) {
    logger.error(`Error fetching stats for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getFundVolatility(identifier: string): Promise<any> {
  const isCIK = /^\d+$/.test(identifier);

  const query = `
    WITH filing_changes AS (
      SELECT
        f1.report_date,
        TO_CHAR(f1.report_date, 'YYYY-Q') AS quarter,
        ROUND(f1.total_value::numeric, 0) AS value_usd,
        LAG(f1.total_value) OVER (ORDER BY f1.report_date) AS prev_value,
        CASE
          WHEN LAG(f1.total_value) OVER (ORDER BY f1.report_date) IS NOT NULL
            AND LAG(f1.total_value) OVER (ORDER BY f1.report_date) != 0
          THEN ROUND(((f1.total_value / LAG(f1.total_value) OVER (ORDER BY f1.report_date) - 1) * 100)::numeric, 2)
          ELSE 0
        END AS percentage_change
      FROM FILINGS f1
      WHERE ${isCIK ? 'f1.cik = $1' : 'LOWER(f1.name) LIKE LOWER($1)'}
        AND f1.total_value IS NOT NULL
      ORDER BY f1.report_date
    )
    SELECT
      quarter,
      COALESCE(percentage_change::text, '0') AS change,
      percentage_change::text AS value
    FROM filing_changes
    WHERE percentage_change IS NOT NULL
    ORDER BY report_date ASC
  `;

  const params = [isCIK ? identifier : `%${identifier}%`];

  try {
    const result = await pool.query(query, params);

    const processedData = result.rows.map((row) => ({
      quarter: row.quarter,
      change: row.change,
      value: parseFloat(row.value),
    }));

    logger.info(`Retrieved volatility data for ${identifier}`);
    return processedData;
  } catch (err) {
    logger.error(`Error fetching volatility data for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getFundPurchases(identifier: string): Promise<any[]> {
  const isCIK = /^\d+$/.test(identifier);

  const query = `
    SELECT
      cik,
      name,
      title,
      class,
      ROUND(value::numeric, 2) as value_usd
    FROM HOLDINGS
    WHERE ${isCIK ? 'cik = $1' : 'LOWER(name) LIKE LOWER($1)'}
  `;

  const params = [isCIK ? identifier : `%${identifier}%`];

  try {
    const result = await pool.query(query, params);
    logger.info(`Retrieved ${result.rows.length} purchases for ${identifier}`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching purchases for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getMostPopularHoldings(
  limit: number = 10,
): Promise<any[]> {
  const query = `
    SELECT
      title,
      class,
      COUNT(DISTINCT cik) as fund_count,
      ROUND(SUM(value)::numeric, 2) as total_value_usd
    FROM HOLDINGS
    GROUP BY title, class
    ORDER BY fund_count DESC, total_value_usd DESC
    LIMIT $1
  `;

  try {
    const result = await pool.query(query, [limit]);
    logger.info(`Retrieved top ${limit} popular holdings`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching popular holdings: ${err}`);
    throw err;
  }
}

export async function getFundClassDistribution(
  identifier: string,
  minPercentageThreshold: number = 0.2,
): Promise<any[]> {
  const isCIK = /^\d+$/.test(identifier);

  const query = `
    WITH class_distribution AS (
      SELECT
        class,
        COUNT(*) as holding_count,
        ROUND(SUM(value)::numeric, 2) as total_value_usd,
        ROUND((SUM(value) / SUM(SUM(value)) OVER ())::numeric * 100, 2) as percentage_of_total
      FROM HOLDINGS
      WHERE ${isCIK ? 'cik = $1' : 'LOWER(name) LIKE LOWER($1)'}
      GROUP BY class
      ORDER BY total_value_usd DESC
    )
    SELECT * FROM class_distribution 
    WHERE percentage_of_total >= $2
    UNION ALL
    SELECT 
      'Other' as class,
      SUM(holding_count) as holding_count,
      SUM(total_value_usd) as total_value_usd,
      SUM(percentage_of_total) as percentage_of_total
    FROM class_distribution
    WHERE percentage_of_total < $2
    HAVING SUM(percentage_of_total) > 0
  `;

  const params = [
    isCIK ? identifier : `%${identifier}%`,
    minPercentageThreshold,
  ];

  try {
    const result = await pool.query(query, params);
    logger.info(
      `Retrieved filtered class distribution for ${identifier} with min threshold ${minPercentageThreshold}%`,
    );
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching class distribution for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getFundTopHoldings(
  identifier: string,
  limit: number = 10,
): Promise<any[]> {
  const isCIK = /^\d+$/.test(identifier);

  const query = `
    SELECT
      title,
      class,
      ROUND(value::numeric, 2) as value_usd,
      ROUND((value / SUM(value) OVER ())::numeric * 100, 2) as percentage_of_total
    FROM HOLDINGS
    WHERE ${isCIK ? 'cik = $1' : 'LOWER(name) LIKE LOWER($1)'}
    ORDER BY value DESC
    LIMIT $2
  `;

  const params = [isCIK ? identifier : `%${identifier}%`, limit];

  try {
    const result = await pool.query(query, params);
    logger.info(`Retrieved top ${limit} holdings for ${identifier}`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching top holdings for ${identifier}: ${err}`);
    throw err;
  }
}
