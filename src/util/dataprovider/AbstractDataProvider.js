import {
    deepClone
} from "../helper/DeepClone.js";
import {
    isEqual
} from "../helper/Comparator.js";
import {
    isArray, isBoolean, isDict, isFunction, isNumberNotNaN, isString, isStringNotEmpty
} from "../helper/CheckType.js";
import {
    debounce
} from "../Debouncer.js";
import {
    DEFAULT_OPTIONS
} from "../helper/collection/ExtractDataFromArray.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import PaginationToolbar from "../../ui/dataview/toolbar/PaginationToolbar.js";
import DataRecieverMixin from "./DataRecieverMixin.js";

export default class AbstractDataProvider extends EventTarget {

    static get defaultOptions() {
        return deepClone(DEFAULT_OPTIONS);
    }

    #options = DEFAULT_OPTIONS;

    #data;

    #reciever;

    #paginationEls = new Set();

    #paginationEventManager = new EventMultiTargetManager();

    #multiSort = false;

    constructor(reciever, initialOptions = {}) {
        if (new.target === AbstractDataProvider) {
            throw new Error("can not construct abstract class");
        }
        if (!(reciever instanceof DataRecieverMixin)) {
            throw new Error("target must extend DataRecieverMixin");
        }
        super();
        this.#reciever = reciever;
        this.#options = this.#extractOptions(initialOptions);
        this.refresh();
        /* --- */
        this.#reciever.addEventListener("sort", (event) => {
            const {columnName} = event.data;
            if (!this.#multiSort) {
                const currentSort = this.#options.sort[0];
                if (currentSort != null && currentSort === columnName) {
                    this.updateOptions({sort: [`!${columnName}`]});
                } else {
                    this.updateOptions({sort: [columnName]});
                }
            } else {
                const currentSort = this.#options.sort;
                const index = currentSort.findIndex((entry) => entry === columnName || entry === `!${columnName}`);
                const newSort = [...currentSort];
                if (index >= 0) {
                    const current = currentSort[index];
                    newSort[index] = current.startsWith("!") ? columnName : `!${columnName}`;
                } else {
                    newSort.push(columnName);
                }
                this.updateOptions({sort: newSort});
            }
        });
        /* --- */
        this.#paginationEventManager.set("page", (event) => {
            const page = event.data - 1;
            this.updateOptions({page});
        });
        this.#paginationEventManager.set("size", (event) => {
            const pageSize = event.data;
            this.updateOptions({page: 0, pageSize});
        });
    }

    get resultSize() {
        return 0;
    }

    set multiSort(value) {
        this.#multiSort = value;
        if (!value) {
            const currentSort = this.#options.sort[0];
            if (currentSort != null) {
                this.updateOptions({sort: [currentSort]});
            }
        }
    }

    get multiSort() {
        return this.#multiSort;
    }

    setPagination(paginationEl) {
        if (paginationEl != null && !(paginationEl instanceof PaginationToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#paginationEls.clear();
        this.#paginationEventManager.clearTargets();
        this.addPagination(paginationEl);
    }

    addPagination(paginationEl) {
        if (paginationEl != null && !(paginationEl instanceof PaginationToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#paginationEls.add(paginationEl);
        this.#paginationEventManager.addTarget(paginationEl);
        this.#updatePaginationEls();
    }

    setOptions(value) {
        const newOptions = this.#extractOptions(value);

        if (!isEqual(this.#options, newOptions)) {
            this.#options = newOptions;
            this.refresh();
        }
    }

    updateOptions(value) {
        const newOptions = this.#extractOptions(value, this.#options);

        if (!isEqual(this.#options, newOptions)) {
            this.#options = newOptions;
            this.refresh();
        }
    }

    getOptions() {
        return deepClone(this.#options);
    }

    refresh = debounce(async () => {
        await this.#reciever.busy();
        this.#reciever.setSortIndicators(deepClone(this.#options.sort ?? []));
        try {
            const data = await this.getData(this.#options);
            if (Array.isArray(data)) {
                if (!isEqual(this.#data, data)) {
                    this.#data = data;
                    this.#reciever.setData(data);
                }
            } else {
                this.#data = [];
                this.#reciever.setData([]);
            }
            this.dispatchEvent(new Event("updated"));
        } catch (err) {
            console.error("error providing data:\n", err);
            this.#reciever.setData([]);
            this.dispatchEvent(new Event("error"));
        } finally {
            this.#updatePaginationEls();
            await this.#reciever.unbusy();
        }
    });

    #updatePaginationEls = debounce(() => {
        for (const paginationEl of this.#paginationEls) {
            if (paginationEl != null) {
                const pageSize = this.#options.pageSize;
                const currentPage = this.#options.page;
                const totalEntries = this.resultSize;
                paginationEl.total = totalEntries;
                if (pageSize != null && pageSize > 0) {
                    const maxPages = Math.ceil(totalEntries / pageSize);
                    paginationEl.size = pageSize;
                    paginationEl.max = maxPages;
                    paginationEl.value = (currentPage ?? 0) + 1;
                } else {
                    paginationEl.size = null;
                    paginationEl.max = 1;
                    paginationEl.value = 1;
                }
            }
        }
    });

    async getData() {
        return [];
    }

    #extractOptions(newOptions, oldOptions = DEFAULT_OPTIONS) {
        const {
            page,
            pageSize,
            sort,
            sortFunction,
            filter,
            filterFunction,
            filterIgnoreNullValues,
            search,
            searchFields
        } = newOptions;

        const result = deepClone(oldOptions);

        if (isNumberNotNaN(page)) {
            result.page = page;
        }
        if (isNumberNotNaN(pageSize)) {
            result.pageSize = pageSize;
        }
        if (isArray(sort)) {
            result.sort = sort.filter((e) => isStringNotEmpty(e));
        }
        if (isFunction(sortFunction)) {
            result.sortFunction = sortFunction;
        }
        if (isDict(filter)) {
            result.filter = filter;
        }
        if (isFunction(filterFunction)) {
            result.filterFunction = filterFunction;
        }
        if (isBoolean(filterIgnoreNullValues)) {
            result.filterIgnoreNullValues = filterIgnoreNullValues;
        }
        if (isString(search)) {
            result.search = search;
        }
        if (isArray(searchFields)) {
            result.searchFields = searchFields.filter((e) => isStringNotEmpty(e));
        }

        return result;
    }

}
