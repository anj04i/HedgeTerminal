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
  filings: FundFiling[];
};

// API Fetch Function
export async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
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
