import xml2js from "xml2js";

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

function padCIK(cik: string | number): string {
  return `CIK${cik.toString().padStart(10, "0")}`;
}

function unpadCIK(paddedCik: string): string {
  return paddedCik.replace("CIK", "").replace(/^0+/, "");
}

function getFilingUrl(
  cik: string,
  accessionNumber: string,
  primaryDoc: string,
  wantXML: boolean = false
) {
  const cleanAccession = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${unpadCIK(
    cik
  )}/${cleanAccession}/${wantXML ? "primary_doc.xml" : primaryDoc}`;
}
async function fetchDetails(cik: string): Promise<SECFiling> {
  const response = await fetch(`${SUBMISSION_URL}/${cik}.json`, {
    headers: {
      "User-Agent": "Your Company Name yourname@example.com", // Required by SEC
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
      "User-Agent": "Your Company Name yourname@example.com",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch filing: ${response.status}`);
  }

  return response.text();
}

const SUBMISSION_URL = "https://data.sec.gov/submissions";

// TESTING
const details = await fetchDetails("CIK0001844452");

const latest = {
  form: details.filings.recent.form[0],
  date: details.filings.recent.filingDate[0],
  accessionNumber: details.filings.recent.accessionNumber[0],
  primaryDoc: details.filings.recent.primaryDocument[0],
  primaryDocDescription: details.filings.recent.primaryDocDescription[0],
};

const url = getFilingUrl(
  "CIK0001844452",
  latest.accessionNumber,
  latest.primaryDoc,
  false
);

const url_xml_true = getFilingUrl(
  "CIK0001844452",
  latest.accessionNumber,
  latest.primaryDoc,
  true
);

console.log(latest);
console.log("\nFiling URL:");
console.log(url);
console.log(url_xml_true);

// Fetch the xml
const xmlContent = await fetchFiling(url_xml_true);
console.log("\nXML Content Length:", xmlContent.length);
const parser = new xml2js.Parser();

// Parse the data to JSON
try {
  const result = await parser.parseStringPromise(xmlContent);
  console.log(result);
} catch (error) {
  console.error("Error parsing XML:", error);
}
