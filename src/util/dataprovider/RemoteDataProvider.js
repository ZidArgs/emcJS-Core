import HTTPMethods from "../../enum/http/HTTPMethods.js";
import {
    isHttpUrl
} from "../helper/CheckType.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

export default class RemoteDataProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source;

    #method = HTTPMethods.POST.toString();

    constructor(reciever, source, method) {
        super(reciever);
        if (!isHttpUrl(source)) {
            throw new Error("source must be a valid HTTP URL");
        }
        if (method instanceof HTTPMethods) {
            this.#method = method.toString();
        } else if (typeof method === "string" && HTTPMethods.includes(method)) {
            this.#method = method;
        }
        this.#source = new URL(source, self.location.origin);
    }

    get resultSize() {
        return this.#resultSize;
    }

    setSource(source = "") {
        if (!isHttpUrl(source)) {
            throw new Error("source must be a valid HTTP URL");
        }
        this.#source = new URL(source, self.location.origin);
        this.triggerUpdate();
    }

    async getData(options = {}) {
        if (this.#source == null) {
            return [];
        }

        const {sort = [], page = 0, pageSize = 0, filter = {}} = options;

        const response = await fetch(this.#source, {
            method: this.#method,
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sort,
                page,
                pageSize,
                filter
            })
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`error providing data [${this.#source.href}] - status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success && result.error) {
            throw new Error(`error providing data [${this.#source.href}] - ${result.error}`);
        }

        this.#resultSize = result.length;

        return result.records;
    }

    setOptions(value) {
        const {sort, page, pageSize, filter} = value;
        super.setOptions({sort, page, pageSize, filter});
    }

    updateOptions(value) {
        const {sort, page, pageSize, filter} = value;
        super.updateOptions({sort, page, pageSize, filter});
    }

}
