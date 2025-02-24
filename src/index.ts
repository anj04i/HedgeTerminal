import { EdgarManager } from "./lib/manager";

async function test() {
  const edgar = new EdgarManager(1423053);
  // const history = await edgar.get13FHistory();
  // console.log(history);

  const details = await edgar.getSecFilingsDetails();
  if (!details.success) return [];

  const recent = edgar.getRecentDetails(details.data);
  const only13F = edgar.filter13F(recent);
  return only13F;
}

// console.log(await main());
