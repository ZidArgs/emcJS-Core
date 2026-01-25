import {deepClone} from "../helper/DeepClone.js";
import {isEqual} from "../helper/Comparator.js";
import {
    isArray, isBoolean, isDict, isFunction, isNumberNotNaN, isString, isStringNotEmpty
} from "../helper/CheckType.js";
import {debounce} from "../Debouncer.js";
import {DEFAULT_EXTRACT_CONFIG} from "../helper/collection/ExtractDataFromArray.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import DataViewControlToolbar from "../../ui/dataview/toolbar/DataViewControlToolbar.js";
import DataReceiverMixin from "./DataReceiverMixin.js";
import EventManagerMixin from "../../ui/mixin/EventManagerMixin.js";

export default class AbstractDataProvider extends EventTarget {

    static get defaultConfig() {
        return deepClone(DEFAULT_EXTRACT_CONFIG);
    }

    #config = DEFAULT_EXTRACT_CONFIG;

    #data;

    #receiver;

    #toolbarEls = new Set();

    #toolbarEventManager = new EventMultiTargetManager();

    #multiSort = false;

    constructor(receiver, options = {}) {
        if (new.target === AbstractDataProvider) {
            throw new Error("can not construct abstract class");
        }
        if (!(receiver instanceof DataReceiverMixin)) {
            throw new Error("target must extend DataReceiverMixin");
        }
        if (!(receiver instanceof EventManagerMixin)) {
            throw new Error("target must extend EventManagerMixin");
        }
        super();
        const {
            config = {}, multiSort = false, toolbar
        } = options;
        this.#receiver = receiver;
        this.#multiSort = !!multiSort;
        this.#config = this.#extractConfig(config);
        if (toolbar != null) {
            this.setToolbar(toolbar);
        }
        this.refresh();
        /* --- */
        this.#receiver.registerTargetEventHandler(this.#receiver, "refresh", () => {
            this.refresh();
        });
        this.#receiver.registerTargetEventHandler(this.#receiver, "search", (event) => {
            const {search} = event.data;
            this.updateConfig({search});
        });
        this.#receiver.registerTargetEventHandler(this.#receiver, "filter", (event) => {
            const {filter} = event.data;
            const newFilter = {...this.#config.filter};
            for (const [key, value] of Object.entries(filter)) {
                newFilter[key] = value;
            }
            this.updateConfig({filter: newFilter});
        });
        this.#receiver.registerTargetEventHandler(this.#receiver, "sort", (event) => {
            const {columnName} = event.data;
            if (!this.#multiSort) {
                const currentSort = this.#config.sort[0];
                if (currentSort != null && currentSort === columnName) {
                    this.updateConfig({sort: [`!${columnName}`]});
                } else {
                    this.updateConfig({sort: [columnName]});
                }
            } else {
                const currentSort = this.#config.sort;
                const index = currentSort.findIndex((entry) => entry === columnName || entry === `!${columnName}`);
                const newSort = [...currentSort];
                if (index >= 0) {
                    const current = currentSort[index];
                    newSort[index] = current.startsWith("!") ? columnName : `!${columnName}`;
                } else {
                    newSort.push(columnName);
                }
                this.updateConfig({sort: newSort});
            }
        });
        this.#receiver.registerTargetEventHandler(this.#receiver, "unsort", (event) => {
            const {columnName} = event.data;
            if (!this.#multiSort) {
                const currentSort = this.#config.sort[0];
                if (currentSort != null && currentSort === columnName) {
                    this.updateConfig({sort: []});
                } else {
                    this.updateConfig({sort: []});
                }
            } else {
                const currentSort = this.#config.sort;
                const newSort = currentSort.filter((entry) => entry !== columnName && entry !== `!${columnName}`);
                this.updateConfig({sort: newSort});
            }
        });
        /* --- */
        this.#toolbarEventManager.set("page", (event) => {
            const page = event.data - 1;
            this.updateConfig({page});
        });
        this.#toolbarEventManager.set("size", (event) => {
            const pageSize = event.data;
            this.updateConfig({
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
            const currentSort = this.#config.sort[0];
            if (currentSort != null) {
                this.updateConfig({sort: [currentSort]});
            }
        }
    }

    get multiSort() {
        return this.#multiSort;
    }

    setToolbar(toolbarEl) {
        if (toolbarEl != null && !(toolbarEl instanceof DataViewControlToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#toolbarEls.clear();
        this.#toolbarEventManager.clearTargets();
        this.addToolbar(toolbarEl);
    }

    addToolbar(toolbarEl) {
        if (toolbarEl != null && !(toolbarEl instanceof DataViewControlToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#toolbarEls.add(toolbarEl);
        this.#toolbarEventManager.addTarget(toolbarEl);
        this.#updateToolbarEls();
    }

    setConfig(value) {
        const newConfig = this.#extractConfig(value);

        if (!isEqual(this.#config, newConfig)) {
            this.#config = newConfig;
            this.refresh();
        }
    }

    updateConfig(value) {
        const newConfig = this.#extractConfig(value, this.#config);

        if (!isEqual(this.#config, newConfig)) {
            this.#config = newConfig;
            this.refresh();
        }
    }

    getConfig() {
        return deepClone(this.#config);
    }

    refresh = debounce(async () => {
        await this.#receiver.busy();
        this.#receiver.setSortIndicators(deepClone(this.#config.sort ?? []));
        try {
            const data = await this.getData(this.#config);
            if (Array.isArray(data)) {
                if (!isEqual(this.#data, data)) {
                    this.#data = data;
                    await this.#receiver.setData(data);
                }
            } else {
                this.#data = [];
                await this.#receiver.setData([]);
            }
            this.dispatchEvent(new Event("updated"));
        } catch (err) {
            console.error("error providing data:\n", err);
            await this.#receiver.setData([]);
            this.dispatchEvent(new Event("error"));
        } finally {
            this.#updateToolbarEls();
            await this.#receiver.unbusy();
        }
    });

    #updateToolbarEls = debounce(() => {
        for (const toolbarEl of this.#toolbarEls) {
            if (toolbarEl != null) {
                const pageSize = this.#config.pageSize;
                const currentPage = this.#config.page;
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

    #extractConfig(newConfig, oldConfig = DEFAULT_EXTRACT_CONFIG) {
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
        } = newConfig;

        const result = deepClone(oldConfig);

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
