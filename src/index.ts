import { EdgarManager } from "./lib/manager";

const edgar = new EdgarManager(1649339);
const history = await edgar.get13FHistory();

console.log(history);
