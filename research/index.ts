import xml2js from 'xml2js';

// SEC uses CIK as identification for each entity
// Eg. CIK0001037389 --> Renaissance Technologies
// CIK is padded length of 10 numbers + 'CIK' string

// Lookup table:
// https://www.sec.gov/files/company_tickers.json

// Details per CIK
// https://data.sec.gov/submissions/CIK0000320193.json

// Infered type from the json (detailed)
// They use parallel arrays (probably to keep things efficient)
// Eg. Index 0 on all data makes up row 0
interface SECFilingRecent {
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
}

interface SECFiling {
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
}

interface SEC13FSummary {
  otherIncludedManagersCount: string;
  tableEntryTotal: string;
  tableValueTotal: string;
  isConfidentialOmitted: string;
}

function padCIK(cik: string | number): string {
  return `CIK${cik.toString().padStart(10, '0')}`;
}

function unpadCIK(paddedCik: string): string {
  return paddedCik.replace('CIK', '').replace(/^0+/, '');
}

function getFilingUrl(
  cik: string,
  accessionNumber: string,
  primaryDoc: string,
  wantXML: boolean = false,
) {
  const cleanAccession = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${unpadCIK(
    cik,
  )}/${cleanAccession}/${wantXML ? 'primary_doc.xml' : primaryDoc}`;
}

function getFilingUrlIndexHtml(
  cik: string,
  accessionNumber: string,
  primaryDoc: string,
  wantXML: boolean = false,
) {
  const cleanAccession = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${unpadCIK(
    cik,
  )}/${cleanAccession}/${accessionNumber}-index.html`;
}

async function fetchDetails(cik: string): Promise<SECFiling> {
  const response = await fetch(`${SUBMISSION_URL}/${cik}.json`, {
    headers: {
      'User-Agent': 'Your Company Name yourname@example.com', // Required by SEC
    },
  });

  if (!response.ok) {
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<SECFiling>;
}

async function fetchFiling(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Your Company Name yourname@example.com',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch filing: ${response.status}`);
  }

  return response.text();
}

async function get13FXmlUrl(indexUrl: string) {
  const response = await fetch(indexUrl, {
    headers: { 'User-Agent': 'Your Company Name yourname@example.com' },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch index: ${response.status}`);
  const html = await response.text();
  const matches = [...html.matchAll(/href="([^"]+\.xml)"/gi)];
  const xmlFiles = matches
    .map((m) => m[1])
    .filter((f) => !f.includes('primary_doc'));
  if (!xmlFiles.length) throw new Error('No valid 13F XML found');
  return new URL(xmlFiles[0], indexUrl).href;
}

async function fetchValue(parser: xml2js.Parser, url: string) {
  const xmlContent = await fetchFiling(url);

  try {
    const result = await parser.parseStringPromise(xmlContent);
    const summary = result.edgarSubmission.formData[0].summaryPage[0];
    const totalValue = summary.tableValueTotal[0];
    return Number(totalValue);
  } catch (error) {
    console.error('Error parsing XML:', error);
  }
}

const SUBMISSION_URL = 'https://data.sec.gov/submissions';

// TESTING
const parser = new xml2js.Parser();
const CIK = padCIK(1067983);
const details = await fetchDetails(CIK);

const { form, filingDate, accessionNumber, primaryDocument } =
  details.filings.recent;

const filings13F = [];

for (let i = 0; i < form.length; i++) {
  if (form[i].startsWith('13')) {
    const filing = {
      form: form[i],
      date: filingDate[i],
      accessionNumber: accessionNumber[i],
      primaryDoc: primaryDocument[i],
      url: getFilingUrl(CIK, accessionNumber[i], primaryDocument[i], true),
      value: fetchValue(
        parser,
        getFilingUrl(CIK, accessionNumber[i], primaryDocument[i], true),
      ),
    };
    filings13F.push(filing);
  }
}

const results = await Promise.all(
  filings13F.map(async (filing) => ({
    ...filing,
    value: await filing.value,
  })),
);

console.log(results);
