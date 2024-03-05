import WebService from "webservice/WebService.js";
import StaticService from "webservice/services/StaticService.js";

const enableCors = process.argv.indexOf("-cors") >= 1;
const port = process.argv.indexOf("-port") >= 1 ? process.argv[process.argv.indexOf("-port") + 1] : "12000";

const service = new WebService(port, {enableCors});
service.registerService(StaticService, "", {serveFolder: "./webtest"});

const po = service.port.toString().padEnd(5);

console.log(``);
console.log(`╔════════════════════════════════════════╗`);
console.log(`║ ┌╦┐ ╭────────────────────────────╮ ┌╦┐ ║`);
console.log(`║  │  │                            │  │  ║`);
console.log(`╠─═╬═─╡   http://localhost:${po}   ╞─═╬═─╣`);
console.log(`║  │  │                            │  │  ║`);
console.log(`║ └╩┘ ╰────────────────────────────╯ └╩┘ ║`);
console.log(`╚════════════════════════════════════════╝`);
console.log(``);
