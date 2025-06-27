import {deepClone} from "../helper/DeepClone.js";
import {isEqual} from "../helper/Comparator.js";
import {
    isArray, isBoolean, isDict, isFunction, isNumberNotNaN, isString, isStringNotEmpty
} from "../helper/CheckType.js";
import {debounce} from "../Debouncer.js";
import {DEFAULT_OPTIONS} from "../helper/collection/ExtractDataFromArray.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import DataViewControlToolbar from "../../ui/dataview/toolbar/DataViewControlToolbar.js";
import DataRecieverMixin from "./DataRecieverMixin.js";

export default class AbstractDataProvider extends EventTarget {

    static get defaultOptions() {
        return deepClone(DEFAULT_OPTIONS);
    }

    #options = DEFAULT_OPTIONS;

    #data;

    #reciever;

    #toolbarEls = new Set();

    #toolbarEventManager = new EventMultiTargetManager();

    #multiSort = false;

    constructor(reciever, multiSort = false, initialOptions = {}) {
        if (new.target === AbstractDataProvider) {
            throw new Error("can not construct abstract class");
        }
        if (!(reciever instanceof DataRecieverMixin)) {
            throw new Error("target must extend DataRecieverMixin");
        }
        super();
        this.#reciever = reciever;
        this.#multiSort = !!multiSort;
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
        this.#reciever.addEventListener("unsort", (event) => {
            const {columnName} = event.data;
            if (!this.#multiSort) {
                const currentSort = this.#options.sort[0];
                if (currentSort != null && currentSort === columnName) {
                    this.updateOptions({sort: []});
                } else {
                    this.updateOptions({sort: []});
                }
            } else {
                const currentSort = this.#options.sort;
                const newSort = currentSort.filter((entry) => entry !== columnName && entry !== `!${columnName}`);
                this.updateOptions({sort: newSort});
            }
        });
        /* --- */
        this.#toolbarEventManager.set("page", (event) => {
            const page = event.data - 1;
            this.updateOptions({page});
        });
        this.#toolbarEventManager.set("size", (event) => {
            const pageSize = event.data;
            this.updateOptions({
                page: 0,
                pageSize
            });
        });
    }

    get resultSize() {
        return 0;
    }

    get totalSize() {
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

    setToolbar(paginationEl) {
        if (paginationEl != null && !(paginationEl instanceof DataViewControlToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#toolbarEls.clear();
        this.#toolbarEventManager.clearTargets();
        this.addToolbar(paginationEl);
    }

    addToolbar(paginationEl) {
        if (paginationEl != null && !(paginationEl instanceof DataViewControlToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#toolbarEls.add(paginationEl);
        this.#toolbarEventManager.addTarget(paginationEl);
        this.#updateToolbarEls();
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
            this.#updateToolbarEls();
            await this.#reciever.unbusy();
        }
    });

    #updateToolbarEls = debounce(() => {
        for (const toolbarEl of this.#toolbarEls) {
            if (toolbarEl != null) {
                const pageSize = this.#options.pageSize;
                const currentPage = this.#options.page;
                const currentEntries = this.resultSize;
                const totalEntries = this.totalSize;
                toolbarEl.entries = currentEntries;
                toolbarEl.total = totalEntries;
                if (pageSize != null && pageSize > 0) {
                    const maxPages = Math.ceil(totalEntries / pageSize);
                    toolbarEl.size = pageSize;
                    toolbarEl.max = maxPages;
                    toolbarEl.value = (currentPage ?? 0) + 1;
                } else {
                    toolbarEl.size = null;
                    toolbarEl.max = 1;
                    toolbarEl.value = 1;
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
