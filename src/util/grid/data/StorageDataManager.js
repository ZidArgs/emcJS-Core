import ObservableStorage from "../../../data/storage/observable/ObservableStorage.js";
import CharacterSearch from "../../search/CharacterSearch.js";

const SORT_PATTERN = /^(!?)(.+)$/;

export default class StorageDataManager {

    #source;

    constructor(source) {
        if (!(source instanceof ObservableStorage)) {
            throw new Error("source must be a ObservableStorage");
        }
        this.#source = source;
    }

    getData(options = {}) {
        const {sort = [], page = 0, pageSize = 0, filter = {}} = options;

        const convertedFilter = Object.entries(filter).map(([key, value]) => {
            return [key, new CharacterSearch(value)];
        });

        const result = Object.entries(this.#source.getAll()).map(([key, value]) => {
            return {
                ...value,
                name: key
            }
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
            return true;
        }).sort((recordA, recordB) => {
            for (const sortKey of sort) {
                const [, desc = "", key = ""] = sortKey.match(SORT_PATTERN) ?? [];
                if (key === "") {
                    continue;
                }
                const valueA = recordA[key];
                const valueB = recordB[key];
                const compareResult = valueA.localeCompare(valueB);
                if (compareResult !== 0) {
                    return !desc ? compareResult : -compareResult;
                }
            }
            return 0;
        });

        if (pageSize > 0) {
            const start = page * pageSize;
            const end = start + pageSize;
            return result.slice(start, end);
        } else {
            return result;
        }
    }

}
