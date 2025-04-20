"use client"
import { useEffect, useState } from 'react';
import { fetchAllFundData } from '@/lib/utils';
import {
  FundFiling,
  Holding,
  ClassDistribution,
  VolatilityData,
  CompleteMetrics,
  SimilarFund,
  StatsResponse,
} from '@/lib/types';

export function useFundData(cik: string | null) {
  const [filings, setFilings] = useState<FundFiling[]>([]);
  const [purchases, setPurchases] = useState<Holding[]>([]);
  const [classDistribution, setClassDistribution] = useState<
    ClassDistribution[]
  >([]);
  const [stats, setStats] = useState<StatsResponse['stats']>({
    aum: 0,
    quarter: '',
    qoq_change: '0',
    yoy_growth: 'N/A',
    total_appreciation: '0',
    volatility: '0',
    max_growth: '0',
    max_decline: '0',
    growth_consistency: '0',
  });
  const [quarterlyChanges, setQuarterlyChanges] = useState<VolatilityData[]>(
    [],
  );
  const [metrics, setMetrics] = useState<CompleteMetrics | null>(null);
  const [similarFunds, setSimilarFunds] = useState<SimilarFund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cik) return;

    setIsLoading(true);
    setError(null);

    fetchAllFundData(cik)
      .then((data) => {
        setFilings(data.filings);
        setStats(data.stats);
        setQuarterlyChanges(data.volatility);
        setPurchases(data.purchases);
        setClassDistribution(data.classDistribution);
        setMetrics(data.metrics);
        setSimilarFunds(data.similarFunds);
      })
      .catch((err) => {
        console.error('Error fetching fund data:', err);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cik]);

  return {
    filings,
    purchases,
    classDistribution,
    stats,
    quarterlyChanges,
    metrics,
    similarFunds,
    isLoading,
    error,
  };
}
