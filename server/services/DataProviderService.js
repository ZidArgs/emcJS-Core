import ServiceModule from "jswebservice/ServiceModule.js";
import {
    numberedStringComparator
} from "../../src/util/helper/Comparator.js";

const SORT_PATTERN = /^(!?)(.+)$/;

const SAMPLE_DATA = [
    {
        key: "0000001",
        name: "A",
        desc: "foobar"
    },
    {
        key: "0000002",
        name: "B",
        desc: "barfoo"
    },
    {
        key: "0000003",
        name: "A",
        desc: "barfoo"
    },
    {
        key: "0000004",
        name: "B",
        desc: "foobar"
    }
];

export default class DataProviderService extends ServiceModule {

    constructor(server, options) {
        super(server);
        if (options == null) {
            options = {};
        }
        server.onrequest = (method, params, query, body) => this.#onrequest(method, params, query, body);
    }

    async #onrequest(method, params, query, body) {
        if (method == "POST") {
            const {sort, page, pageSize, filter} = body;
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
        const data = [...SAMPLE_DATA].sort((recordA, recordB) => {
            // apply sort by column
            for (const sortKey of sort) {
                const [, desc = "", key = ""] = sortKey.match(SORT_PATTERN) ?? [];
                if (key === "") {
                    continue;
                }
                const valueA = recordA[key];
                const valueB = recordB[key];

                if (valueA == null || valueB == null) {
                    continue;
                }

                const compareResult = numberedStringComparator(valueA, valueB);
                if (compareResult !== 0) {
                    return !desc ? compareResult : -compareResult;
                }
            }
            // default sort order
            return 0;
        });

        return {
            success: true,
            error: false,
            params: {
                sort,
                page,
                pageSize,
                filter
            },
            length: 10,
            records: data
        };
    }

}
