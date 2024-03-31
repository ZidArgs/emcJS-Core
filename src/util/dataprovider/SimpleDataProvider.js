import {
    deepClone
} from "../helper/DeepClone.js";
import {
    numberedStringComparator
} from "../helper/Comparator.js";
import CharacterSearch from "../search/CharacterSearch.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

const SORT_PATTERN = /^(!?)(.+)$/;

export default class SimpleDataProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source = [];

    constructor(target, source) {
        super(target);
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
        this.triggerUpdate();
    }

    async getData(options = {}) {
        if (this.#source == null) {
            return [];
        }

        const {sort = [], page = 0, pageSize = 0, filter = {}, filterFunction = false} = options;

        const convertedFilter = Object.entries(filter).map(([key, value]) => {
            return [key, new CharacterSearch(value)];
        });

        const result = this.#source.map((record) => {
            return deepClone(record);
        }).filter((record) => {
            if (typeof record !== "object") {
                throw new Error("source contained non object value");
            }

            for (const [key, filter] of convertedFilter) {
                const value = record[key];
                if (!filter.test(value)) {
                    return false;
                }
            }
            if (typeof filterFunction === "function") {
                return filterFunction(record);
            }
            return true;
        }).sort((recordA, recordB) => {
            for (const sortKey of sort) {
                const [, desc = "", key = ""] = sortKey.match(SORT_PATTERN) ?? [];
                if (key === "") {
                    continue;
                }
                const valueA = recordA[key];
                const valueB = recordB[key];
                const compareResult = numberedStringComparator(valueA, valueB);
                if (compareResult !== 0) {
                    return !desc ? compareResult : -compareResult;
                }
            }
            return 0;
        });

        this.#resultSize = result.length;

        if (pageSize > 0) {
            const start = page * pageSize;
            const end = start + pageSize;
            return result.slice(start, end);
        } else {
            return result;
        }
    }

}
