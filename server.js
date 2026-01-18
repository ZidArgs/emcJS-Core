import WebService from "jswebservice/WebService.js";
import StaticService from "jswebservice/services/StaticService.js";
import DataProviderService from "./server/services/DataProviderService.js";

const enableCors = process.argv.indexOf("-cors") >= 1;
const port = process.argv.indexOf("-port") >= 1 ? process.argv[process.argv.indexOf("-port") + 1] : "12000";

const service = new WebService(port, {enableCors});
service.registerServiceModule(StaticService, "", {serveFolder: "./webtest"});
service.registerServiceModule(DataProviderService, "/api/data/simple", {dataSource: "./server/data/SimpleData.json"});
service.registerServiceModule(DataProviderService, "/api/data/large", {dataSource: "./server/data/LargeData.json"});

service.printServerInfoPanel();
