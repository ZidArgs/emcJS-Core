import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import EventTargetManager from "../event/EventTargetManager.js";
import {
    deepClone
} from "../helper/DeepClone.js";
import {
    numberedStringComparator
} from "../helper/Comparator.js";
import CharacterSearch from "../search/CharacterSearch.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

const SORT_PATTERN = /^(!?)(.+)$/;

export default class ObservableStorageProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source;

    #eventManager = new EventTargetManager();

    constructor(reciever, source) {
        super(reciever);
        if (source != null && !(source instanceof ObservableStorage)) {
            throw new Error("source must be a ObservableStorage");
        }
        /* --- */
        this.#eventManager.set(["change", "clear", "load"], () => {
            this.refresh();
        });
        /* --- */
        this.#source = source;
        if (source != null) {
            this.#eventManager.switchTarget(source);
        }
    }

    get resultSize() {
        return this.#resultSize;
    }

    setSource(source) {
        if (!(source != null && source instanceof ObservableStorage)) {
            throw new Error("source must be a ObservableStorage");
        }
        this.#source = source;
        if (source != null) {
            this.#eventManager.switchTarget(source);
        }
        this.refresh();
    }

    async getData(options = {}) {
        if (this.#source == null) {
            return [];
        }

        const {
            sort = [],
            page = 0,
            pageSize = 0,
            filter = {},
            sortFunction = false,
            filterFunction = false
        } = options;

        const convertedFilter = Object.entries(filter).map(([key, value]) => {
            return [key, new CharacterSearch(value)];
        });

        const result = [...this.#source.keys()].map(([key, value]) => {
            if (typeof value !== "object") {
                throw new Error("source contained non object value");
            }
            return {
                ...deepClone(value),
                key
            };
        }).filter((record) => {
            // apply filter by column
            for (const [key, filter] of convertedFilter) {
                const value = record[key];
                if (!filter.test(value)) {
                    return false;
                }
            }
            // apply filter function
            if (typeof filterFunction === "function") {
                return filterFunction(record);
            }
            // not filtered
            return true;
        }).sort((recordA, recordB) => {
            // apply sort function
            if (typeof sortFunction === "function") {
                const res = sortFunction(recordA, recordB);
                if (res != 0) {
                    return res;
                }
            }
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
