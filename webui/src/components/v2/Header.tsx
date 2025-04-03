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
}

export const Header: React.FC<HeaderProps> = ({
  fundMap,
  selectedFund,
  onSelectFund,
  isMobile = false,
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
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
};
