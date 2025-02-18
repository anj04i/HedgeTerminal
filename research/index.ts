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

function getFilingUrlIndexHtml(
  cik: string,
  accessionNumber: string,
  primaryDoc: string,
  wantXML: boolean = false
) {
  const cleanAccession = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${unpadCIK(
    cik
  )}/${cleanAccession}/${accessionNumber}-index.html`;
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

async function get13FXmlUrl(indexUrl: string) {
  const response = await fetch(indexUrl, {
    headers: { "User-Agent": "Your Company Name yourname@example.com" },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch index: ${response.status}`);
  const html = await response.text();
  const matches = [...html.matchAll(/href="([^"]+\.xml)"/gi)];
  const xmlFiles = matches
    .map((m) => m[1])
    .filter((f) => !f.includes("primary_doc"));
  if (!xmlFiles.length) throw new Error("No valid 13F XML found");
  return new URL(xmlFiles[0], indexUrl).href;
}

const SUBMISSION_URL = "https://data.sec.gov/submissions";

// TESTING
const CIK = padCIK(1037389);
const details = await fetchDetails(CIK);

const { form, filingDate, accessionNumber, primaryDocument } =
  details.filings.recent;

// Use raw for loop, insanely fast for large datasets ~200ms
const filings = [];
for (let i = 0; i < form.length; i++) {
  filings.push({
    form: form[i],
    date: filingDate[i],
    accessionNumber: accessionNumber[i],
    primaryDoc: primaryDocument[i],
  });
}

const filings13F = filings.filter((f) => f.form.startsWith("13"));

const latest = filings13F[0];

const url_xml_false = getFilingUrl(
  CIK,
  latest.accessionNumber,
  latest.primaryDoc,
  false
);

const url_xml_true = getFilingUrl(
  CIK,
  latest.accessionNumber,
  latest.primaryDoc,
  true
);

const index = getFilingUrlIndexHtml(
  CIK,
  latest.accessionNumber,
  latest.primaryDoc
);

console.log(latest);
console.log("\nFiling URL:");
console.log(url_xml_true);
console.log(url_xml_false);
console.log(index);

// 13F form has a different /route to it
// Need to parse html file and look for it
console.log(await get13FXmlUrl(index));

// // Fetch the xml
// const xmlContent = await fetchFiling(url_xml_true);
// console.log("\nXML Content Length:", xmlContent.length);
// const parser = new xml2js.Parser();

// // Parse the data to JSON
// try {
//   const result = await parser.parseStringPromise(xmlContent);
//   console.log(result);
// } catch (error) {
//   console.error("Error parsing XML:", error);
// }
