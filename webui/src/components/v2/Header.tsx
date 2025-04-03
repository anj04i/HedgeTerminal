import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { darkTheme } from './theme';

interface HeaderProps {
  fundMap: Record<string, string>;
  selectedFund: string | null;
  onSelectFund: (fundName: string, cik: string) => void;
  isMobile?: boolean;
  exportData?: () => any; // Function that returns the data to export
}

export const Header: React.FC<HeaderProps> = ({
  fundMap,
  selectedFund,
  onSelectFund,
  isMobile = false,
  exportData,
}) => {
  const getCurrentFundName = () => {
    if (!selectedFund) return null;

    if (fundMap[selectedFund]) return selectedFund;

    for (const [name, cik] of Object.entries(fundMap)) {
      if (cik === selectedFund) return name;
    }
    return null;
  };

  const currentFundName = getCurrentFundName();

  const handleExport = () => {
    if (!exportData) return;

    try {
      // Get the data to export
      const data = exportData();

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(data, null, 2);

      // Create a Blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');

      // Set up the download
      link.href = url;
      link.download = `${currentFundName || 'fund'}_data.json`;

      // Append to body, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('There was an error exporting the data. Please try again.');
    }
  };

  return (
    <div
      className={`flex items-center ${isMobile ? 'flex-col py-2' : 'justify-between px-4 py-3'} border-b`}
      style={{ borderColor: darkTheme.border }}
    >
      <div
        className="text-lg font-medium flex items-center"
        style={{ color: darkTheme.text }}
      >
        <span
          className="font-mono text-base"
          style={{ color: darkTheme.accent }}
        >
          &gt;_
        </span>
        <span className="ml-1" style={{ color: darkTheme.accent }}>
          HedgeTerminal
        </span>
      </div>
      <div
        className={`flex items-center gap-4 ${isMobile ? 'w-full px-2' : ''}`}
      >
        <Select
          value={currentFundName || ''}
          onValueChange={(fundName) =>
            onSelectFund(fundName, fundMap[fundName])
          }
        >
          <SelectTrigger
            className={`text-sm border rounded h-10 ${isMobile ? 'flex-1' : 'w-64'}`}
            style={{
              backgroundColor: darkTheme.cardBackground,
              borderColor: darkTheme.border,
              color: darkTheme.text,
            }}
          >
            <SelectValue
              placeholder="Select fund..."
              style={{ color: darkTheme.text }}
            >
              {currentFundName || 'Select fund...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className="border rounded text-sm z-50"
            style={{
              backgroundColor: darkTheme.cardBackground,
              borderColor: darkTheme.border,
              color: darkTheme.text,
            }}
          >
            {Object.entries(fundMap).map(([name]) => (
              <SelectItem
                key={name}
                value={name}
                className="cursor-pointer text-sm px-3 py-2"
                style={{
                  color: darkTheme.text,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f25';
                  e.currentTarget.style.color = darkTheme.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = darkTheme.text;
                }}
              >
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          className={`h-10 px-6 rounded text-sm font-medium transition ${isMobile ? 'w-auto' : ''}`}
          style={{
            backgroundColor: darkTheme.accent,
            color: '#0f0f13',
            cursor: 'pointer',
          }}
          onClick={handleExport}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkTheme.accentHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = darkTheme.accent;
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
};
