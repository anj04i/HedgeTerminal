-- Create the materialized view with one row per fund
CREATE MATERIALIZED VIEW fund_stats AS WITH first_filings AS (
    -- Get the first filing for each fund
    SELECT
        cik,
        MIN(report_date) AS first_date
    FROM
        FILINGS
    WHERE
        total_value IS NOT NULL
    GROUP BY
        cik
),
first_values AS (
    -- Get the first value for each fund
    SELECT
        f.cik,
        f.total_value AS first_value
    FROM
        FILINGS f
        JOIN first_filings ff ON f.cik = ff.cik
        AND f.report_date = ff.first_date
),
latest_filings AS (
    -- Get the latest filing for each fund
    SELECT
        cik,
        MAX(report_date) AS latest_date
    FROM
        FILINGS
    WHERE
        total_value IS NOT NULL
    GROUP BY
        cik
),
latest_values AS (
    -- Get the latest values for each fund
    SELECT
        f.cik,
        f.total_value AS aum,
        TO_CHAR(f.report_date, 'YYYY-Q') AS quarter,
        f.report_date
    FROM
        FILINGS f
        JOIN latest_filings lf ON f.cik = lf.cik
        AND f.report_date = lf.latest_date
),
prev_quarters AS (
    -- Get the previous quarter for each filing
    SELECT
        f1.cik,
        f1.report_date,
        f1.total_value,
        MAX(f2.report_date) AS prev_date
    FROM
        FILINGS f1
        LEFT JOIN FILINGS f2 ON f1.cik = f2.cik
        AND f2.report_date < f1.report_date
        AND f2.total_value IS NOT NULL
    WHERE
        f1.total_value IS NOT NULL
    GROUP BY
        f1.cik,
        f1.report_date,
        f1.total_value
),
quarterly_changes AS (
    -- Calculate quarter-over-quarter changes
    SELECT
        pq.cik,
        pq.report_date,
        pq.total_value,
        CASE
            WHEN f.total_value IS NOT NULL
            AND f.total_value != 0 THEN ROUND(
                ((pq.total_value / f.total_value - 1) * 100) :: numeric,
                2
            )
            ELSE NULL
        END AS qoq_change
    FROM
        prev_quarters pq
        LEFT JOIN FILINGS f ON pq.cik = f.cik
        AND f.report_date = pq.prev_date
),
volatility_stats AS (
    -- Calculate volatility stats
    SELECT
        cik,
        ROUND(COALESCE(STDDEV(qoq_change), 0) :: numeric, 2) :: text AS volatility,
        ROUND(COALESCE(MAX(qoq_change), 0) :: numeric, 2) :: text AS max_growth,
        ROUND(COALESCE(MIN(qoq_change), 0) :: numeric, 2) :: text AS max_decline
    FROM
        quarterly_changes
    GROUP BY
        cik
),
growth_consistency AS (
    -- Calculate growth consistency
    SELECT
        cik,
        CASE
            WHEN COUNT(*) > 0 THEN ROUND(
                (
                    COUNT(
                        CASE
                            WHEN qoq_change > 0 THEN 1
                        END
                    ) * 100.0 / NULLIF(COUNT(*), 0)
                ) :: numeric,
                2
            ) :: text
            ELSE '0'
        END AS growth_consistency
    FROM
        quarterly_changes
    GROUP BY
        cik
),
recent_trend AS (
    -- Calculate recent trend (last year)
    SELECT
        qc.cik,
        ROUND(COALESCE(AVG(qc.qoq_change), 0) :: numeric, 2) :: text AS recent_trend
    FROM
        quarterly_changes qc
        JOIN latest_values lv ON qc.cik = lv.cik
    WHERE
        qc.report_date >= (lv.report_date - INTERVAL '1 year')
    GROUP BY
        qc.cik
),
latest_change AS (
    -- Get the latest quarter change
    SELECT
        qc.cik,
        qc.qoq_change
    FROM
        quarterly_changes qc
        JOIN latest_values lv ON qc.cik = lv.cik
        AND qc.report_date = lv.report_date
) -- Final result combining all metrics
SELECT
    lv.cik,
    lv.aum,
    lv.quarter,
    COALESCE(lc.qoq_change, 0) AS qoq_change,
    vs.volatility,
    vs.max_growth,
    vs.max_decline,
    gc.growth_consistency,
    COALESCE(rt.recent_trend, '0') AS recent_trend,
    COALESCE(
        ROUND(
            ((lv.aum / fv.first_value - 1) * 100) :: numeric,
            1
        ) :: text,
        '0'
    ) AS total_appreciation
FROM
    latest_values lv
    JOIN first_values fv ON lv.cik = fv.cik
    LEFT JOIN volatility_stats vs ON lv.cik = vs.cik
    LEFT JOIN growth_consistency gc ON lv.cik = gc.cik
    LEFT JOIN recent_trend rt ON lv.cik = rt.cik
    LEFT JOIN latest_change lc ON lv.cik = lc.cik;

-- Create an index for fast lookups
CREATE UNIQUE INDEX idx_fund_stats_cik ON fund_stats (cik);