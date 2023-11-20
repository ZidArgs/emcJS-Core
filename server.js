import WebService from "webservice/WebService.js";
import StaticService from "webservice/services/StaticService.js";

const cors = process.argv.indexOf("-cors") >= 1;
const port = process.argv.indexOf("-port") >= 1 ? process.argv[process.argv.indexOf("-port") + 1] : "12000";

const service = new WebService(port, cors);
service.registerService(StaticService, "", {serveFolder: "./webtest"});

console.log(``);
console.log(`=================================`);
console.log(`=     http://localhost:${port}\t=`);
console.log(`=================================`);
console.log(``);
