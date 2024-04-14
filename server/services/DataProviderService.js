import ServiceModule from "jswebservice/ServiceModule.js";

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
            records: [
                {
                    key: "0000001",
                    name: "A",
                    desc: "foobar"
                },
                {
                    key: "0000002",
                    name: "B",
                    desc: "barfoo"
                }
            ]
        };
    }

}
