CREATE MATERIALIZED VIEW FUND_COMPLETE_METRICS AS WITH -- Common CTEs from the first view
first_filings AS (
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
        f.name,
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
            AND f.total_value != 0 THEN ((pq.total_value / f.total_value) - 1)
            ELSE NULL
        END AS qoq_change_decimal,
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
        STDDEV(qoq_change_decimal) * 100 AS aum_volatility_pct,
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
),
-- Maximum AUM ever achieved per fund (for drawdown calculation)
max_aum AS (
    SELECT
        cik,
        MAX(total_value) AS peak_value
    FROM
        FILINGS
    GROUP BY
        cik
),
-- Filing lag calculation
filing_lags AS (
    SELECT
        cik,
        AVG(filing_date - report_date) AS avg_lag_days
    FROM
        FILINGS
    GROUP BY
        cik
),
-- Calculate holding weights for each fund's latest filing
holding_weights AS (
    SELECT
        h.cik,
        h.title,
        h.class,
        h.value,
        SUM(h.value) OVER (PARTITION BY h.cik) AS total_portfolio_value,
        h.value / NULLIF(SUM(h.value) OVER (PARTITION BY h.cik), 0) AS weight,
        ROW_NUMBER() OVER (
            PARTITION BY h.cik
            ORDER BY
                h.value DESC
        ) AS holding_rank
    FROM
        HOLDINGS h
        JOIN latest_values lv ON h.cik = lv.cik
),
-- Top position concentration
top_position AS (
    SELECT
        cik,
        MAX(
            CASE
                WHEN holding_rank = 1 THEN weight
                ELSE 0
            END
        ) * 100 AS top_holding_pct
    FROM
        holding_weights
    GROUP BY
        cik
),
-- Top 10 holdings share
top_ten_share AS (
    SELECT
        cik,
        SUM(
            CASE
                WHEN holding_rank <= 10 THEN weight
                ELSE 0
            END
        ) * 100 AS top_10_holdings_pct
    FROM
        holding_weights
    GROUP BY
        cik
),
-- Diversification score (1 / sum of squared weights)
diversification AS (
    SELECT
        cik,
        1 / NULLIF(SUM(weight * weight), 0) AS diversification_score
    FROM
        holding_weights
    GROUP BY
        cik
),
-- Uniqueness calculation - holdings that appear in only one fund
unique_holdings AS (
    SELECT
        title,
        class
    FROM
        HOLDINGS
    GROUP BY
        title,
        class
    HAVING
        COUNT(DISTINCT cik) = 1
),
-- Calculate uniqueness score per fund
uniqueness_score AS (
    SELECT
        h.cik,
        COUNT(
            DISTINCT CASE
                WHEN uh.title IS NOT NULL THEN h.title || h.class
                ELSE NULL
            END
        ) * 100.0 / NULLIF(COUNT(DISTINCT h.title || h.class), 0) AS uniqueness_pct
    FROM
        HOLDINGS h
        LEFT JOIN unique_holdings uh ON h.title = uh.title
        AND h.class = uh.class
    GROUP BY
        h.cik
),
-- Fund similarity based on holding overlap
fund_similarity AS (
    SELECT
        h1.cik AS fund1,
        h2.cik AS fund2,
        COUNT(*) AS overlap_count,
        ROW_NUMBER() OVER (
            PARTITION BY h1.cik
            ORDER BY
                COUNT(*) DESC
        ) AS similarity_rank
    FROM
        HOLDINGS h1
        JOIN HOLDINGS h2 ON h1.title = h2.title
        AND h1.class = h2.class
        AND h1.cik != h2.cik
    GROUP BY
        h1.cik,
        h2.cik
),
-- Only keep the most similar fund for each fund
most_similar AS (
    SELECT
        fund1 AS cik,
        fund2 AS most_similar_fund,
        overlap_count
    FROM
        fund_similarity
    WHERE
        similarity_rank = 1
) -- Final result combining all metrics
SELECT
    lv.cik,
    lv.name,
    -- Metrics from fund_stats
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
            ((lv.aum / NULLIF(fv.first_value, 0) - 1) * 100) :: numeric,
            1
        ) :: text,
        '0'
    ) AS total_appreciation_str,
    -- Metrics from FUND_METRICS
    COALESCE(
        ROUND(
            (lv.aum / NULLIF(fv.first_value, 0) - 1) * 100,
            2
        ),
        0
    ) AS total_appreciation_pct,
    COALESCE(ROUND(lc.qoq_change, 2), 0) AS latest_qoq_change_pct,
    COALESCE(ROUND(tp.top_holding_pct, 2), 0) AS top_holding_pct,
    COALESCE(ROUND(tts.top_10_holdings_pct, 2), 0) AS top_10_holdings_pct,
    COALESCE(ROUND(d.diversification_score, 2), 0) AS diversification_score,
    COALESCE(ROUND(us.uniqueness_pct, 2), 0) AS uniqueness_score,
    ms.most_similar_fund,
    ms.overlap_count,
    COALESCE(ROUND(vs.aum_volatility_pct, 2), 0) AS aum_volatility_pct,
    COALESCE(
        ROUND(
            (1 - (lv.aum / NULLIF(ma.peak_value, 0))) * 100,
            2
        ),
        0
    ) AS drawdown_from_peak_pct,
    COALESCE(ROUND(fl.avg_lag_days, 1), 0) AS avg_filing_lag_days,
    -- Additional info
    lv.report_date AS latest_report_date
FROM
    latest_values lv
    JOIN first_values fv ON lv.cik = fv.cik
    LEFT JOIN volatility_stats vs ON lv.cik = vs.cik
    LEFT JOIN growth_consistency gc ON lv.cik = gc.cik
    LEFT JOIN recent_trend rt ON lv.cik = rt.cik
    LEFT JOIN latest_change lc ON lv.cik = lc.cik
    LEFT JOIN max_aum ma ON lv.cik = ma.cik
    LEFT JOIN filing_lags fl ON lv.cik = fl.cik
    LEFT JOIN top_position tp ON lv.cik = tp.cik
    LEFT JOIN top_ten_share tts ON lv.cik = tts.cik
    LEFT JOIN diversification d ON lv.cik = d.cik
    LEFT JOIN uniqueness_score us ON lv.cik = us.cik
    LEFT JOIN most_similar ms ON lv.cik = ms.cik;

-- Create index for faster lookups
CREATE UNIQUE INDEX idx_fund_complete_metrics_cik ON FUND_COMPLETE_METRICS(cik);