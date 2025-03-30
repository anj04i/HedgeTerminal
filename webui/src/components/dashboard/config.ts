// Dashboard styling configuration
export const config = {
  primaryColor: '#3B82F6',
  primaryColorLight: '#DBEAFE',
  primaryGradientStart: '#3B82F6',
  primaryGradientEnd: '#3B82F6',
  tooltipBackground: '#FFFFFF',
  tooltipText: '#111827',
  tooltipBorder: '#E5E7EB',
  gridStroke: '#E5E7EB',
  axisText: '#6B7280',
  axisLabel: '#374151',
  bgBase: 'bg-gray-50',
  bgCard: 'bg-white',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-800',
  textMuted: 'text-gray-900',
  textHighlightPositive: 'text-green-600',
  textHighlightNegative: 'text-red-600',
  borderBase: 'border-gray-200',
};

export const apiConfig = {
  funds: [
    {
      cik: '1067983',
      name: 'Berkshire Hathaway',
    },
    {
      cik: '1350694',
      name: 'Bridgewater Associates',
    },
    {
      cik: '1423053',
      name: 'Citadel Advisors',
    },
    {
      cik: '1273087',
      name: 'Millennium Management',
    },
    {
      cik: '1637460',
      name: 'Man Group',
    },
    {
      cik: '1009207',
      name: 'D.E. Shaw & Co.',
    },
    {
      cik: '1037389',
      name: 'Renaissance Technologies',
    },
    {
      cik: '1167557',
      name: 'AQR Capital Management',
    },
    {
      cik: '1179392',
      name: 'Two Sigma Investments',
    },
    {
      cik: '1336528',
      name: 'Pershing Square Capital Management',
    },
    {
      cik: '1048445',
      name: 'Elliott Management',
    },
    {
      cik: '1061768',
      name: 'Baupost Group',
    },
    {
      cik: '1103804',
      name: 'Viking Global Investors',
    },
    {
      cik: '909661',
      name: 'Farallon Capital Management',
    },
    {
      cik: '1061165',
      name: 'Lone Pine Capital',
    },
    {
      cik: '1167483',
      name: 'Tiger Global Management',
    },
    {
      cik: '1165408',
      name: 'Adage Capital Management',
    },
    {
      cik: '1364742',
      name: 'BlackRock',
    },
    {
      cik: '1135730',
      name: 'Coatue Management',
    },
    {
      cik: '1318757',
      name: 'Marshall Wace',
    },
  ],
};

export const fundMap: Record<string, string> = {
  'Berkshire Hathaway': '1067983',
  'Bridgewater Associates': '1350694',
  'Citadel Advisors': '1423053',
  'Millennium Management': '1273087',
  'Man Group': '1637460',
  'D.E. Shaw & Co.': '1009207',
  'Renaissance Technologies': '1037389',
  'AQR Capital Management': '1167557',
  'Two Sigma Investments': '1179392',
  'Pershing Square Capital Management': '1336528',
  'Elliott Management': '1048445',
  'Baupost Group': '1061768',
  'Viking Global Investors': '1103804',
  'Farallon Capital Management': '909661',
  'Lone Pine Capital': '1061165',
  'Tiger Global Management': '1167483',
  'Adage Capital Management': '1165408',
  BlackRock: '1364742',
  'Coatue Management': '1135730',
  'Marshall Wace': '1318757',
};
