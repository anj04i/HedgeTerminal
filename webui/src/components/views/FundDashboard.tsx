"use client"
import { useState, useEffect } from 'react';
import { fundMap } from './config';
import { FundHeader } from './FundHeader';
import { Header } from './Header';
import { darkTheme } from './theme';
import { ChartContainer } from './ChartContainer';
import { HoldingsPanel } from './HoldingsPanel';
import { FilingHistoryPanel } from './FilingHistoryPanel';
import { PortfolioMetricsPanel } from './PortfolioMetricsPanel';
import { useFundData } from '../hooks/useFundData';

// Custom hook for responsive detection with throttling
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create the media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define a throttled handler
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handler = (event: MediaQueryListEvent) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setMatches(event.matches);
      }, 150); // 150ms throttle
    };

    // Add the event listener
    mediaQuery.addEventListener('change', handler);

    // Clean up
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

interface FundDashboardProps {
  initialCik?: string | null;
}

export const FundDashboard: React.FC<FundDashboardProps> = ({ initialCik }) => {
  const [selectedFund, setSelectedFund] = useState<string | null>(
    initialCik || null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState<'charts' | 'filings' | 'holdings'>(
    'charts',
  );

  // Use the custom hook for responsive detection
  const isMobile = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (!selectedFund && !initialCik) {
      setSelectedFund(fundMap['Berkshire Hathaway'] || Object.values(fundMap)[0]);
    }
  }, [initialCik, selectedFund]);

  const {
    filings,
    purchases,
    classDistribution,
    stats,
    quarterlyChanges,
    metrics,
    similarFunds,
    isLoading,
    error,
  } = useFundData(selectedFund);

  const handleSelectFund = (fundName: string, cik: string) => {
    setIsTransitioning(true);
    setSelectedFund(cik);
  };

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setIsTransitioning(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Function to create the export data object
  const getExportData = () => {
    // Get current fund name
    let currentFundName = null;
    if (selectedFund) {
      if (fundMap[selectedFund]) {
        currentFundName = selectedFund;
      } else {
        for (const [name, cik] of Object.entries(fundMap)) {
          if (cik === selectedFund) {
            currentFundName = name;
            break;
          }
        }
      }
    }

    // Return all the data in a well-structured format
    return {
      fund: {
        name: currentFundName,
        cik: selectedFund,
      },
      metrics,
      stats,
      filings,
      holdings: purchases,
      classDistribution,
      quarterlyChanges,
      similarFunds,
      exportDate: new Date().toISOString(),
    };
  };

  if (error) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center text-gray-100 select-none"
        style={{ backgroundColor: darkTheme.background }}
      >
        <div className="text-red-400">Error loading fund data</div>
        <div className="text-sm text-gray-400 mt-2">{error.message}</div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col text-gray-100 transition-opacity duration-300 select-none"
      style={{
        backgroundColor: darkTheme.background,
        opacity: isTransitioning ? 0.5 : 1,
        transition: 'opacity 150ms ease-in-out',
      }}
    >
      <Header
        fundMap={fundMap}
        selectedFund={selectedFund}
        onSelectFund={handleSelectFund}
        isMobile={isMobile}
        exportData={getExportData}
      />
      <FundHeader metrics={metrics} isMobile={isMobile} />

      {isMobile && (
        <div
          className="flex border-b"
          style={{ borderColor: darkTheme.border }}
        >
          <button
            className="flex-1 py-2 text-xs font-medium"
            style={{
              backgroundColor:
                activeTab === 'charts'
                  ? darkTheme.cardBackground
                  : 'transparent',
              color:
                activeTab === 'charts'
                  ? darkTheme.accent
                  : darkTheme.secondaryText,
              borderBottom:
                activeTab === 'charts'
                  ? `2px solid ${darkTheme.accent}`
                  : 'none',
            }}
            onClick={() => setActiveTab('charts')}
          >
            Charts
          </button>
          <button
            className="flex-1 py-2 text-xs font-medium"
            style={{
              backgroundColor:
                activeTab === 'filings'
                  ? darkTheme.cardBackground
                  : 'transparent',
              color:
                activeTab === 'filings'
                  ? darkTheme.accent
                  : darkTheme.secondaryText,
              borderBottom:
                activeTab === 'filings'
                  ? `2px solid ${darkTheme.accent}`
                  : 'none',
            }}
            onClick={() => setActiveTab('filings')}
          >
            Filings
          </button>
          <button
            className="flex-1 py-2 text-xs font-medium"
            style={{
              backgroundColor:
                activeTab === 'holdings'
                  ? darkTheme.cardBackground
                  : 'transparent',
              color:
                activeTab === 'holdings'
                  ? darkTheme.accent
                  : darkTheme.secondaryText,
              borderBottom:
                activeTab === 'holdings'
                  ? `2px solid ${darkTheme.accent}`
                  : 'none',
            }}
            onClick={() => setActiveTab('holdings')}
          >
            Holdings
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <>
            {activeTab === 'charts' && (
              <ChartContainer
                metrics={metrics}
                filings={filings}
                quarterlyChanges={quarterlyChanges}
                classDistribution={classDistribution}
              />
            )}
            {activeTab === 'filings' && (
              <FilingHistoryPanel filings={filings} isMobile={true} />
            )}
            {activeTab === 'holdings' && (
              <HoldingsPanel holdings={purchases} isMobile={true} />
            )}
          </>
        ) : (
          <>
            <ChartContainer
              metrics={metrics}
              filings={filings}
              quarterlyChanges={quarterlyChanges}
              classDistribution={classDistribution}
            />
            <FilingHistoryPanel filings={filings} />
            <HoldingsPanel holdings={purchases} />
          </>
        )}
      </div>

      {/* Only show PortfolioMetricsPanel on non-mobile screens */}
      {!isMobile && (
        <PortfolioMetricsPanel
          metrics={metrics}
          stats={stats}
          isMobile={false}
        />
      )}
    </div>
  );
};
