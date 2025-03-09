import { EdgarManager } from './lib/manager';

async function test() {
  const edgar = new EdgarManager(886982);
  const history = await edgar.get13FHistory();
  return history;
}

console.log(await test());
