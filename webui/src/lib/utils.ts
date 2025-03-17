import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API Types
export type Fund = {
  name: string;
  cik: string;
};

export type FundFiling = {
  quarter: string;
  value_usd: number;
};

export type ConfigResponse = {
  funds: Fund[];
};

export type FilingsResponse = {
  message: string;
  filings: FundFiling[];
};

export type StatsResponse = {
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
};

export type VolatilityData = {
  quarter: string;
  change: string;
  value: number;
};

export type VolatilityResponse = {
  message: string;
  volatility: VolatilityData[];
};

export type Purchase = {
  cik: string;
  name: string;
  title: string;
  class: string;
  value_usd: number;
};

export type PurchasesResponse = {
  message: string;
  purchases: Purchase[];
};

export type ClassDistribution = {
  class: string;
  holding_count: number;
  total_value_usd: number;
  percentage_of_total: number;
};

export type ClassDistributionResponse = {
  message: string;
  distribution: ClassDistribution[];
};

export type Holding = {
  title: string;
  class: string;
  value_usd: number;
  percentage_of_total: number;
};

export type TopHoldingsResponse = {
  message: string;
  holdings: Holding[];
};

export type PopularHolding = {
  title: string;
  class: string;
  fund_count: number;
  total_value_usd: number;
};

export type PopularHoldingsResponse = {
  message: string;
  holdings: PopularHolding[];
};

// API Fetch Function
export async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}
