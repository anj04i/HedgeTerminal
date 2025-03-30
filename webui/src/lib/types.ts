export interface Fund {
  name: string;
  cik: string;
}

export interface ConfigResponse {
  funds: Fund[];
}

export interface FundFiling {
  quarter: string;
  value_usd: number;
}

export interface FilingsResponse {
  message: string;
  filings: FundFiling[];
}

export interface StatsResponse {
  message: string;
  stats: {
    aum: number;
    quarter: string;
    qoq_change: string;
    yoy_growth: string;
    total_appreciation: string;
    volatility: string;
    max_growth: string;
    max_decline: string;
    growth_consistency: string;
  };
}

export interface VolatilityData {
  quarter: string;
  change: string;
  value: number;
}

export interface VolatilityResponse {
  message: string;
  volatility: VolatilityData[];
}

export interface Holding {
  title: string;
  class: string;
  value_usd: number;
  percentage_of_total?: number;
}

export interface HoldingsResponse {
  message: string;
  holdings: Holding[];
}

export interface ClassDistribution {
  class: string;
  holding_count: number;
  total_value_usd: number;
  percentage_of_total: number;
}

export interface ClassDistributionResponse {
  message: string;
  distribution: ClassDistribution[];
}

export interface CompleteMetrics {
  cik: string;
  name: string;
  aum: string;
  quarter: string;
  qoq_change: string;
  volatility: string;
  max_growth: string;
  max_decline: string;
  growth_consistency: string;
  recent_trend: string;
  total_appreciation_str: string;
  total_appreciation_pct: string;
  latest_qoq_change_pct: string;
  top_holding_pct: string;
  top_10_holdings_pct: string;
  diversification_score: string;
  uniqueness_score: string;
  most_similar_fund: string;
  overlap_count: string;
  aum_volatility_pct: string;
  drawdown_from_peak_pct: string;
  avg_filing_lag_days: string;
  latest_report_date: string;
}

export interface MetricsResponse {
  message: string;
  metrics: CompleteMetrics;
}

export interface SimilarFund {
  cik: string;
  name: string;
  overlap_count: number;
  overlap_percentage: number;
}

export interface SimilarFundsResponse {
  message: string;
  similar: SimilarFund[];
}

export interface PurchasesResponse {
  message: string;
  purchases: Holding[];
}

export interface PopularHoldingsResponse {
  message: string;
  holdings: Holding[];
}
