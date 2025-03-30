import {
  ConfigResponse,
  FilingsResponse,
  StatsResponse,
  VolatilityResponse,
  HoldingsResponse,
  ClassDistributionResponse,
  PurchasesResponse,
  PopularHoldingsResponse,
  MetricsResponse,
  SimilarFundsResponse,
  FullFundResponse,
} from './types';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API || '';

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// Specific API functions for cleaner code
export async function fetchConfig(): Promise<ConfigResponse> {
  return fetchApi<ConfigResponse>('/api/config');
}

export async function fetchFundFilings(cik: string): Promise<FilingsResponse> {
  return fetchApi<FilingsResponse>(`/api/funds/${cik}/filings`);
}

export async function fetchFundStats(cik: string): Promise<StatsResponse> {
  return fetchApi<StatsResponse>(`/api/funds/${cik}/stats`);
}

export async function fetchFundVolatility(
  cik: string,
): Promise<VolatilityResponse> {
  return fetchApi<VolatilityResponse>(`/api/funds/${cik}/volatility`);
}

export async function fetchFundPurchases(
  cik: string,
): Promise<PurchasesResponse> {
  return fetchApi<PurchasesResponse>(`/api/funds/${cik}/purchases`);
}

export async function fetchFundClassDistribution(
  cik: string,
): Promise<ClassDistributionResponse> {
  return fetchApi<ClassDistributionResponse>(
    `/api/funds/${cik}/class-distribution`,
  );
}

export async function fetchFundTopHoldings(
  cik: string,
): Promise<HoldingsResponse> {
  return fetchApi<HoldingsResponse>(`/api/funds/${cik}/top-holdings`);
}

export async function fetchPopularHoldings(): Promise<PopularHoldingsResponse> {
  return fetchApi<PopularHoldingsResponse>('/api/holdings/popular');
}

export async function fetchFundMetrics(cik: string): Promise<MetricsResponse> {
  return fetchApi<MetricsResponse>(`/api/funds/${cik}/metrics`);
}

export async function fetchSimilarFunds(
  cik: string,
): Promise<SimilarFundsResponse> {
  return fetchApi<SimilarFundsResponse>(`/api/funds/${cik}/similar`);
}

export async function fetchTopPerformingFunds(
  limit: number = 10,
): Promise<any> {
  return fetchApi<any>(`/api/funds/top-performing?limit=${limit}`);
}

export async function fetchMostUniqueFunds(limit: number = 10): Promise<any> {
  return fetchApi<any>(`/api/funds/most-unique?limit=${limit}`);
}

export async function fetchAllFundData(
  cik: string,
): Promise<FullFundResponse['data']> {
  const res = await fetchApi<FullFundResponse>(`/api/funds/${cik}/all`);
  return res.data;
}

// Format currency for display
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Format percentage for display
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Format large numbers with B/M/K suffixes
export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toString();
}
