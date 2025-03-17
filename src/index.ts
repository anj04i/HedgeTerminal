import { EdgarManager } from './lib/manager';

async function test() {
  try {
    const edgar = new EdgarManager(1067983);
    console.log('Fetching SEC filing details...');
    const details = await edgar.getSecFilingsDetails();

    if (!details.success) {
      console.error('Error fetching filing details:', details.error);
      return [];
    }

    console.log('Successfully fetched filing details');
    const recent = edgar.getRecentDetails(details.data);
    console.log(`Found ${recent.length} recent filings`);

    const only13F = edgar.filter13F(recent);
    console.log(`Found ${only13F.length} 13F filings`);

    const records = await edgar.extract13FRecords(only13F);
    console.log(`Successfully extracted ${records.length} 13F records`);

    return records;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

test()
  .then((results) => {
    console.log('Final results:', results.length > 0 ? results : 'Empty array');
  })
  .catch((err) => {
    console.error('Test function error:', err);
  });
