CREATE MATERIALIZED VIEW FUND_ALL_PAYLOAD AS WITH fund_data AS (
    SELECT
        DISTINCT cik
    FROM
        FILINGS
)
SELECT
    fd.cik,
    jsonb_build_object(
        'filings',
        (
            SELECT
                jsonb_agg(row_to_json(f))
            FROM
                (
                    SELECT
                        cik,
                        CONCAT(
                            EXTRACT(
                                YEAR
                                FROM
                                    report_date
                            ),
                            '-',
                            EXTRACT(
                                QUARTER
                                FROM
                                    report_date
                            )
                        ) as quarter,
                        ROUND(total_value :: numeric, 2) as value_usd
                    FROM
                        FILINGS
                    WHERE
                        cik = fd.cik
                    ORDER BY
                        report_date
                ) f
        ),
        'stats',
        (
            SELECT
                row_to_json(s)
            FROM
                (
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
                    FROM
                        FUND_COMPLETE_METRICS
                    WHERE
                        cik = fd.cik
                ) s
        ),
        'volatility',
        (
            SELECT
                jsonb_agg(row_to_json(v))
            FROM
                (
                    SELECT
                        quarter,
                        COALESCE(percentage_change :: text, '0') AS change,
                        percentage_change :: text AS value
                    FROM
                        (
                            SELECT
                                TO_CHAR(f1.report_date, 'YYYY-Q') AS quarter,
                                CASE
                                    WHEN LAG(f1.total_value) OVER (
                                        ORDER BY
                                            f1.report_date
                                    ) IS NOT NULL
                                    AND LAG(f1.total_value) OVER (
                                        ORDER BY
                                            f1.report_date
                                    ) != 0 THEN ROUND(
                                        (
                                            (
                                                f1.total_value / LAG(f1.total_value) OVER (
                                                    ORDER BY
                                                        f1.report_date
                                                ) - 1
                                            ) * 100
                                        ) :: numeric,
                                        2
                                    )
                                    ELSE 0
                                END AS percentage_change
                            FROM
                                FILINGS f1
                            WHERE
                                f1.cik = fd.cik
                                AND f1.total_value IS NOT NULL
                            ORDER BY
                                f1.report_date
                        ) volatility_data
                    WHERE
                        percentage_change IS NOT NULL
                ) v
        ),
        'purchases',
        (
            SELECT
                jsonb_agg(row_to_json(p))
            FROM
                (
                    SELECT
                        cik,
                        name,
                        title,
                        class,
                        ROUND(value :: numeric, 2) as value_usd
                    FROM
                        HOLDINGS
                    WHERE
                        cik = fd.cik
                ) p
        ),
        'classDistribution',
        (
            SELECT
                jsonb_agg(row_to_json(cd))
            FROM
                (
                    WITH class_dist_temp AS (
                        SELECT
                            class,
                            COUNT(*) as holding_count,
                            ROUND(SUM(value) :: numeric, 2) as total_value_usd,
                            ROUND(
                                (SUM(value) / NULLIF(SUM(SUM(value)) OVER (), 0)) :: numeric * 100,
                                2
                            ) as percentage_of_total
                        FROM
                            HOLDINGS
                        WHERE
                            cik = fd.cik
                        GROUP BY
                            class
                        ORDER BY
                            total_value_usd DESC
                    )
                    SELECT
                        *
                    FROM
                        class_dist_temp
                    WHERE
                        percentage_of_total >= 0.2
                    UNION
                    ALL
                    SELECT
                        'Other' as class,
                        SUM(holding_count) as holding_count,
                        SUM(total_value_usd) as total_value_usd,
                        SUM(percentage_of_total) as percentage_of_total
                    FROM
                        class_dist_temp
                    WHERE
                        percentage_of_total < 0.2
                    HAVING
                        SUM(percentage_of_total) > 0
                ) cd
        ),
        'metrics',
        (
            SELECT
                row_to_json(m)
            FROM
                FUND_COMPLETE_METRICS m
            WHERE
                cik = fd.cik
        ),
        'similarFunds',
        (
            SELECT
                jsonb_agg(row_to_json(sf))
            FROM
                (
                    SELECT
                        fund2_cik AS cik,
                        fund2_name AS name,
                        overlap_count,
                        ROUND(overlap_percentage :: numeric, 2) AS overlap_percentage
                    FROM
                        (
                            SELECT
                                h1.cik AS fund1_cik,
                                h2.cik AS fund2_cik,
                                f2.name AS fund2_name,
                                COUNT(*) AS overlap_count,
                                COUNT(*) * 100.0 / NULLIF(
                                    (
                                        SELECT
                                            COUNT(*)
                                        FROM
                                            HOLDINGS
                                        WHERE
                                            cik = fd.cik
                                    ),
                                    0
                                ) AS overlap_percentage
                            FROM
                                HOLDINGS h1
                                JOIN HOLDINGS h2 ON h1.title = h2.title
                                AND h1.class = h2.class
                                AND h1.cik <> h2.cik
                                JOIN FILINGS f2 ON h2.cik = f2.cik
                            WHERE
                                h1.cik = fd.cik
                            GROUP BY
                                h1.cik,
                                h2.cik,
                                f2.name
                        ) overlap_counts
                    ORDER BY
                        overlap_count DESC
                    LIMIT
                        5
                ) sf
        )
    ) AS payload
FROM
    fund_data fd;

-- Create index for faster lookups
CREATE UNIQUE INDEX idx_fund_all_payload_cik ON FUND_ALL_PAYLOAD(cik);