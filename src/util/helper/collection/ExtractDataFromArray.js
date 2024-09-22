import {
    numberedStringComparator
} from "../Comparator.js";
import CharacterSearch from "../../search/CharacterSearch.js";
import {
    isArray, isArrayOf, isBoolean, isDict, isFunction, isNull, isNumber, isNumberNotNaN, isObject, isString, isStringNotEmpty
} from "../CheckType.js";

const SORT_PATTERN = /^(!?)(.+)$/;

export const OPTION_PARAMS = {
    PAGE: "page",
    PAGE_SIZE: "pageSize",
    SORT: "sort",
    SORT_FUNCTION: "sortFunction",
    FILTER: "filter",
    FILTER_FUNCTION: "filterFunction",
    SEARCH: "search",
    SEARCH_FIELDS: "searchFields"
};

export const DEFAULT_OPTIONS = {
    page: 0,
    pageSize: 0,
    sort: [],
    sortFunction: null,
    filter: {},
    filterFunction: null,
    search: "",
    searchFields: []
};

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
 *      filterFunction: function,
 *      search: string,
 *      searchFields: string[]
 * }} options the manipulation options for the extraction
 * @returns {{records: Array.<Object.<string, *>>, total: number}} the resulting record list and its size before pagination
 */
export function extractData(source = [], options = {}) {
    if (!Array.isArray(source)) {
        throw new Error("source must be an array");
    }

    const {
        page = DEFAULT_OPTIONS.page,
        pageSize = DEFAULT_OPTIONS.pageSize,
        sort = DEFAULT_OPTIONS.sort,
        sortFunction = DEFAULT_OPTIONS.sortFunction,
        filter = DEFAULT_OPTIONS.filter,
        filterFunction = DEFAULT_OPTIONS.filterFunction,
        search = DEFAULT_OPTIONS.search,
        searchFields = DEFAULT_OPTIONS.searchFields
    } = options;

    if (!isArrayOf(sort, isStringNotEmpty)) {
        throw new Error("\"sort\" must be an array of non empty strings");
    }
    if (!isNumberNotNaN(page)) {
        throw new Error("\"page\" must be a valid number");
    }
    if (!isNumberNotNaN(pageSize)) {
        throw new Error("\"pageSize\" must be a valid number");
    }
    if (!isDict(filter)) {
        throw new Error("\"filter\" must be a dict");
    }
    if (!isFunction(filterFunction) && !isNull(filterFunction)) {
        throw new Error("\"filterFunction\" must be a function or null");
    }
    if (!isFunction(sortFunction) && !isNull(sortFunction)) {
        throw new Error("\"sortFunction\" must be a function or null");
    }
    if (!isString(search)) {
        throw new Error("\"search\" must be a string");
    }
    if (!isArrayOf(searchFields, isStringNotEmpty) && !isNull(searchFields)) {
        throw new Error("\"searchFields\" must be an array of non empty strings");
    }

    const convertedFilter = Object.entries(filter).map(([key, value]) => {
        return [key, prepareFilter(value)];
    }).filter(([, value]) => {
        return isArray(value) && value.length > 0;
    });

    const convertedSearch = isStringNotEmpty(search) ? new CharacterSearch(search) : null;

    const result = source.filter((record) => {
        // filter all non object entries
        if (!isObject(record)) {
            return false;
        }
        // apply filter by column
        for (const [key, filterList] of convertedFilter) {
            const value = record[key];
            if (!testFilterList(value, filterList)) {
                return false;
            }
        }
        // apply filter function
        if (filterFunction != null) {
            return filterFunction(record);
        }
        // apply search
        if (convertedSearch != null) {
            if (searchFields.length) {
                for (const key of searchFields) {
                    const value = record[key];
                    if (convertedSearch.test(value)) {
                        return true;
                    }
                }
            } else {
                for (const key in record) {
                    const value = record[key];
                    if (convertedSearch.test(value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        // not filtered
        return true;
    }).sort((recordA, recordB) => {
        // apply sort function
        if (sortFunction != null) {
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

function prepareFilter(value) {
    if (isNull(value)) {
        return [];
    }
    if (!isArray(value)) {
        value = [value];
    }
    const res = [];
    for (const v of value) {
        if (isStringNotEmpty(v)) {
            res.push(new CharacterSearch(v));
        } else if (isNumberNotNaN(v) || isBoolean(v)) {
            res.push(v);
        }
    }
    return res;
}

function testFilterList(value, filterList) {
    for (const filter of filterList) {
        if (filter instanceof CharacterSearch) {
            if (filter.test(value)) {
                return true;
            }
        } else if (filter === value) {
            return true;
        }
    }
    return false;
}
