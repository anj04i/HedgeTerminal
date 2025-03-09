import { EdgarManager } from "./lib/manager";

async function test() {
  const edgar = new EdgarManager(1067983);
  const history = await edgar.get13FHistory();
  return history
}

console.log(await test());


