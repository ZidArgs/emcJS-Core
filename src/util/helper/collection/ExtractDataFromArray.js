import {
    numberedStringComparator
} from "../Comparator.js";
import CharacterSearch from "../../search/CharacterSearch.js";
import {
    isBoolean, isNumber
} from "../CheckType.js";

const SORT_PATTERN = /^(!?)(.+)$/;

/**
 * Extract data from an array using filter and sort options and cut out a page if needed
 *
 * @param {Array.<Object.<string, *>>} source the array to extract the data from
 * @param {{
 *      page: number,
 *      pageSize: number,
 *      sort: string[],
 *      sortFunction: function,
 *      filter: Object.<string, *>,
 *      filterFunction: function
 * }} options the manipulation options for the extraction
 * @returns {{records: Array.<Object.<string, *>>, total: number}} the resulting record list and its size before pagination
 */
export function extractData(source = [], options = {}) {
    if (!Array.isArray(source)) {
        throw new Error("source must be an array");
    }

    const {
        page = 0,
        pageSize = 0,
        sort = [],
        sortFunction = false,
        filter = {},
        filterFunction = false
    } = options;

    const convertedFilter = Object.entries(filter).map(([key, value]) => {
        return [key, new CharacterSearch(value)];
    });

    const result = source.filter((record) => {
        // filter all non object entries
        if (typeof record !== "object") {
            return false;
        }
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

            if ((isBoolean(valueA) && isBoolean(valueB)) || (isNumber(valueA) && isNumber(valueB))) {
                const compareResult = valueA - valueB;
                if (compareResult !== 0) {
                    return !desc ? compareResult : -compareResult;
                }
            } else {
                const compareResult = numberedStringComparator(valueA.toString(), valueB.toString());
                if (compareResult !== 0) {
                    return !desc ? compareResult : -compareResult;
                }
            }
        }
        // default sort order
        return 0;
    });

    const resultSize = result.length;

    if (pageSize > 0) {
        const start = page * pageSize;
        const end = start + pageSize;
        return {
            records: result.slice(start, end),
            total: resultSize
        };
    } else {
        return {
            records: result,
            total: resultSize
        };
    }
}
