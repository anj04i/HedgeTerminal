import { CIK } from './cik';

export enum ErrorType {
  FETCH_ERROR = 'FETCH_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

export type ErrorTypes = { type: ErrorType; error: Error };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorTypes };

export type CIKType = CIK;

export type SECFiling = {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  insiderTransactionForOwnerExists: number;
  insiderTransactionForIssuerExists: number;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  description: string;
  website: string;
  investorWebsite: string;
  category: string;
  fiscalYearEnd: string;
  stateOfIncorporation: string;
  stateOfIncorporationDescription: string;
  addresses: {
    mailing: {
      street1: string;
      street2: string | null;
      city: string;
      stateOrCountry: string;
      zipCode: string;
      stateOrCountryDescription: string;
    };
    business: {
      street1: string;
      street2: string | null;
      city: string;
      stateOrCountry: string;
      zipCode: string;
      stateOrCountryDescription: string;
    };
  };
  phone: string;
  flags: string;
  filings: {
    recent: SECFilingRecent;
    files: any[];
  };
};

export type SECFilingRecent = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  acceptanceDateTime: string[];
  act: string[];
  form: string[];
  fileNumber: string[];
  filmNumber: string[];
  items: string[];
  size: number[];
  isXBRL: number[];
  isInlineXBRL: number[];
  primaryDocument: string[];
  primaryDocDescription: string[];
};

export type SECFilingRecord = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string | null;
  acceptanceDateTime: string;
  act: string | null;
  form: string;
  fileNumber: string | null;
  filmNumber: string | null;
  items: string | null;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  primaryDocument: string;
  primaryDocDescription: string | null;
  filingURL: string;
};

export type SEC13FSummary = {
  otherIncludedManagersCount: string;
  tableEntryTotal: string;
  tableValueTotal: string;
  isConfidentialOmitted: string;
};

export type Extract13FRecord = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  totalValue: number;
};

export type SEC13FHolding = {
  title: string;
  class: string;
  value: number;
};
