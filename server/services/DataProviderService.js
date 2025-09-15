import fs from "fs";
import path from "path";
import ServiceModule from "jswebservice/ServiceModule.js";
import {extractData} from "../../src/util/helper/collection/ExtractDataFromArray.js";
import {
    isArrayOf, isDict
} from "../../src/util/helper/CheckType.js";
import jsonParse from "../../src/patches/JSONParser.js";

export default class DataProviderService extends ServiceModule {

    #baseData = [];

    constructor(server, options) {
        super(server);
        if (options == null) {
            options = {};
        }
        this.#loadData(options.dataSource);
        server.onrequest = (method, params, query, body) => this.#onrequest(method, params, query, body);
    }

    async #loadData(filePath) {
        if (typeof filePath !== "string") {
            return;
        }
        const resolvedFilePath = path.join("./", filePath);
        if (fs.existsSync(resolvedFilePath)) {
            const stat = fs.statSync(resolvedFilePath);
            if (stat.isFile(resolvedFilePath)) {
                const input = fs.readFileSync(resolvedFilePath).toString();
                try {
                    const data = jsonParse(input);
                    if (isArrayOf(data, (e) => isDict(e))) {
                        this.#baseData = data;
                    } else {
                        console.log(`[${this.instanceName}] Requested data is not an Array of records: "${filePath}"`);
                    }
                    return;
                } catch (err) {
                    console.log(`[${this.instanceName}] Requested data parse error: "${filePath}"`, err);
                }
            }
        }
        console.log(`[${this.instanceName}] Requested data not found: "${filePath}"`);
    }

    async #onrequest(method, params, query, body) {
        if (method == "POST") {
            const {
                sort, page, pageSize, filter
            } = body;
            try {
                const data = await this.#getResponseData(sort, page, pageSize, filter);

                return {
                    status: 200,
                    json: data
                };
            } catch (err) {
                console.error(err);
                return {
                    status: 500,
                    json: {
                        success: false,
                        error: err.message,
                        params: {
                            sort,
                            page,
                            pageSize,
                            filter
                        },
                        length: 0,
                        records: []
                    }
                };
            }
        } else {
            return {status: 405};
        }
    }

    #getResponseData(sort, page, pageSize, filter) {
        const options = {
            sort,
            page,
            pageSize,
            filter
        };

        const {
            records, total
        } = extractData([...this.#baseData], options);

        return {
            success: true,
            error: false,
            params: options,
            length: total,
            records
        };
    }

}
