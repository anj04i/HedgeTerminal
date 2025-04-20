import { Extract13FRecord, SEC13FHolding } from '../lib/types';
import logger from '../utils/logger';
import { pool } from './config';

function standardizeIdentifier(identifier: string) {
  const isCIK = /^\d+$/.test(identifier);
  const condition = isCIK ? 'cik = $1' : 'LOWER(name) LIKE LOWER($1)';
  const param = isCIK ? identifier : `%${identifier}%`;
  return { condition, param, isCIK };
}

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
  const { condition, param } = standardizeIdentifier(identifier);
  logger.info(`Fetching filings for identifier: ${identifier}`);

  const query = `
  SELECT
    cik,
    CONCAT(EXTRACT(YEAR FROM report_date), '-', EXTRACT(QUARTER FROM report_date)) as quarter,
    ROUND(total_value::numeric, 2) as value_usd
  FROM FILINGS
  WHERE ${condition}
  ORDER BY report_date
  `;

  try {
    const result = await pool.query(query, [param]);
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
  const { condition, param } = standardizeIdentifier(identifier);

  const query = `
    SELECT
      aum,
      quarter,
      qoq_change,
      recent_trend AS yoy_growth,
      total_appreciation_str AS total_appreciation,
      volatility,
      max_growth,
      max_decline,
      growth_consistency
    FROM FUND_COMPLETE_METRICS
    WHERE ${condition}
  `;

  try {
    const result = await pool.query(query, [param]);
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

export async function getFundCompleteMetrics(identifier: string): Promise<any> {
  const { condition, param } = standardizeIdentifier(identifier);

  const query = `
    SELECT *
    FROM FUND_COMPLETE_METRICS
    WHERE ${condition}
  `;

  try {
    const result = await pool.query(query, [param]);
    if (!result.rows.length) {
      return {
        cik: '',
        name: '',
        aum: 0,
        quarter: '',
        qoq_change: 0,
        volatility: '0',
        max_growth: '0',
        max_decline: '0',
        growth_consistency: '0',
        recent_trend: '0',
        total_appreciation_str: '0',
        total_appreciation_pct: 0,
        latest_qoq_change_pct: 0,
        top_holding_pct: 0,
        top_10_holdings_pct: 0,
        diversification_score: 0,
        uniqueness_score: 0,
        most_similar_fund: null,
        overlap_count: 0,
        aum_volatility_pct: 0,
        drawdown_from_peak_pct: 0,
        avg_filing_lag_days: 0,
        latest_report_date: null,
      };
    }

    logger.info(`Retrieved complete metrics for ${identifier}`);
    return result.rows[0];
  } catch (err) {
    logger.error(`Error fetching complete metrics for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getFundVolatility(identifier: string): Promise<any> {
  const { condition, param } = standardizeIdentifier(identifier);

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
      WHERE ${condition}
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

  try {
    const result = await pool.query(query, [param]);

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
  const { condition, param } = standardizeIdentifier(identifier);

  const query = `
    SELECT
      cik,
      name,
      title,
      class,
      ROUND(value::numeric, 2) as value_usd
    FROM HOLDINGS
    WHERE ${condition}
  `;

  try {
    const result = await pool.query(query, [param]);
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
  const { condition, param } = standardizeIdentifier(identifier);

  const query = `
    WITH class_distribution AS (
      SELECT
        class,
        COUNT(*) as holding_count,
        ROUND(SUM(value)::numeric, 2) as total_value_usd,
        ROUND((SUM(value) / SUM(SUM(value)) OVER ())::numeric * 100, 2) as percentage_of_total
      FROM HOLDINGS
      WHERE ${condition}
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

  try {
    const result = await pool.query(query, [param, minPercentageThreshold]);
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
  const { condition, param } = standardizeIdentifier(identifier);

  const query = `
    SELECT
      title,
      class,
      ROUND(value::numeric, 2) as value_usd,
      ROUND((value / SUM(value) OVER ())::numeric * 100, 2) as percentage_of_total
    FROM HOLDINGS
    WHERE ${condition}
    ORDER BY value DESC
    LIMIT $2
  `;

  try {
    const result = await pool.query(query, [param, limit]);
    logger.info(`Retrieved top ${limit} holdings for ${identifier}`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching top holdings for ${identifier}: ${err}`);
    throw err;
  }
}

export async function getSimilarFunds(
  cik: string,
  limit: number = 5,
): Promise<any[]> {
  const query = `
    WITH overlap_counts AS (
      SELECT 
        h1.cik AS fund1_cik,
        h2.cik AS fund2_cik,
        f2.name AS fund2_name,
        COUNT(*) AS overlap_count,
        COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM HOLDINGS WHERE cik = h1.cik
        ) AS overlap_percentage
      FROM HOLDINGS h1
      JOIN HOLDINGS h2 ON h1.title = h2.title AND h1.class = h2.class AND h1.cik <> h2.cik
      JOIN FILINGS f2 ON h2.cik = f2.cik
      WHERE h1.cik = $1
      GROUP BY h1.cik, h2.cik, f2.name
    )
    SELECT 
      fund2_cik AS cik,
      fund2_name AS name,
      overlap_count,
      ROUND(overlap_percentage::numeric, 2) AS overlap_percentage
    FROM overlap_counts
    ORDER BY overlap_count DESC
    LIMIT $2
  `;

  try {
    const result = await pool.query(query, [cik, limit]);
    logger.info(`Retrieved ${result.rows.length} similar funds for ${cik}`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching similar funds for ${cik}: ${err}`);
    throw err;
  }
}

export async function getTopPerformingFunds(
  limit: number = 10,
): Promise<any[]> {
  const query = `
    SELECT 
      cik,
      name,
      aum,
      quarter,
      qoq_change,
      total_appreciation_pct
    FROM FUND_COMPLETE_METRICS
    WHERE aum > 10000000  -- Filter out very small funds (optional)
    ORDER BY total_appreciation_pct DESC
    LIMIT $1
  `;

  try {
    const result = await pool.query(query, [limit]);
    logger.info(`Retrieved ${result.rows.length} top performing funds`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching top performing funds: ${err}`);
    throw err;
  }
}

export async function getMostUniqueFunds(limit: number = 10): Promise<any[]> {
  const query = `
    SELECT 
      cik,
      name,
      aum,
      uniqueness_score,
      diversification_score,
      top_10_holdings_pct
    FROM FUND_COMPLETE_METRICS
    WHERE aum > 10000000  -- Filter out very small funds
    ORDER BY uniqueness_score DESC
    LIMIT $1
  `;

  try {
    const result = await pool.query(query, [limit]);
    logger.info(`Retrieved ${result.rows.length} most unique funds`);
    return result.rows;
  } catch (err) {
    logger.error(`Error fetching most unique funds: ${err}`);
    throw err;
  }
}

export async function refreshFundMetrics(): Promise<void> {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW FUND_COMPLETE_METRICS');
    await pool.query('REFRESH MATERIALIZED VIEW FUND_ALL_PAYLOAD');
    logger.info(
      'Successfully refreshed FUND_COMPLETE_METRICS materialized view',
    );
  } catch (err) {
    logger.error(`Error refreshing materialized view: ${err}`);
    throw err;
  }
}

export async function getFundAllPayload(cik: string): Promise<any> {
  try {
    const result = await pool.query(
      'SELECT payload FROM FUND_ALL_PAYLOAD WHERE cik = $1',
      [cik],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].payload;
  } catch (err) {
    logger.error(`Error fetching full fund payload for ${cik}: ${err}`);
    throw err;
  }
}
