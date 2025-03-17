import { EdgarManager } from './lib/manager';

async function test() {
  const edgar = new EdgarManager(1067983);
  const details = await edgar.get13FHistory();
  return details;

  // const lastBuys = await edgar.getLatestBuys();
  // if (!lastBuys.success) return [];
  // return lastBuys;
}

console.log(await test());
