import {isObject} from "../helper/CheckType.js";
import {deepClone} from "../helper/DeepClone.js";
import {deleteAtIndex} from "../helper/collection/ArrayMutations.js";
import {extractData} from "../helper/collection/ExtractDataFromArray.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

export default class SimpleDataProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source = [];

    constructor(reciever, source, initialOptions) {
        super(reciever, initialOptions);
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

    getSource() {
        return deepClone(this.#source);
    }

    addEntry(entry) {
        if (!isObject(entry)) {
            throw new Error("entry must be an object");
        }
        if ("key" in entry) {
            const found = this.#source.findIndex((e) => {
                return e.key === entry.key;
            });
            if (found >= 0) {
                deleteAtIndex(this.#source, found);
            }
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
