import {
    isObject
} from "../helper/CheckType.js";
import {
    deepClone
} from "../helper/DeepClone.js";
import {
    extractData
} from "../helper/collection/ExtractDataFromArray.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

export default class SimpleDataProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source = [];

    constructor(reciever, source) {
        super(reciever);
        if (source != null) {
            if (!Array.isArray(source)) {
                throw new Error("source must be an Array or null");
            }
            this.#source = deepClone(source);
        }
    }

    get resultSize() {
        return this.#resultSize;
    }

    setSource(source = []) {
        if (!Array.isArray(source)) {
            throw new Error("source must be an Array");
        }
        this.#source = deepClone(source);
        this.refresh();
    }

    addEntry(entry) {
        if (!isObject(entry)) {
            throw new Error("entry must be an object");
        }
        this.#source.push(entry);
        this.refresh();
    }

    async getData(options = {}) {
        if (this.#source == null) {
            this.#resultSize = 0;
            return [];
        }

        const result = extractData(this.#source.map((record) => {
            if (!isObject(record)) {
                throw new Error("source contained non object value");
            }
            return deepClone(record);
        }), options);

        this.#resultSize = result.total;
        return result.records;
    }

}
