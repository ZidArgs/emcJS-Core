import {
    deepClone
} from "../../helper/DeepClone.js";
import {
    isEqual
} from "../../helper/Comparator.js";
import {
    debounce
} from "../../Debouncer.js";
import EventTargetManager from "../../event/EventTargetManager.js";
import DataGrid from "../../../ui/grid/DataGrid.js";
import PaginationToolbar from "../../../ui/grid/components/pagination/PaginationToolbar.js";

const DEFAULT_OPTIONS = {sort: [], page: 0, pageSize: 0, filter: {}, filterFunction: false};

export default class AbstractDataProvider {

    static get defaultOptions() {
        return deepClone(DEFAULT_OPTIONS);
    }

    #options = DEFAULT_OPTIONS;

    #data;

    #gridEl;

    #paginationEl;

    #paginationEventManager = new EventTargetManager();

    constructor(grid) {
        if (new.target === AbstractDataProvider) {
            throw new Error("can not construct abstract class");
        }
        if (!(grid instanceof DataGrid)) {
            throw new Error("target must be an instance of DataGrid");
        }
        this.#gridEl = grid;
        this.triggerUpdate();
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

    setPagination(paginationEl) {
        if (paginationEl != null && !(paginationEl instanceof PaginationToolbar)) {
            throw new Error("paginationEl must be an instance of PaginationToolbar");
        }
        this.#paginationEl = paginationEl;
        this.#paginationEventManager.switchTarget(paginationEl);
        this.#updatePaginationEl();
    }

    setOptions(value) {
        const {sort, page, pageSize, filter, filterFunction} = value;
        const newOptions = deepClone(DEFAULT_OPTIONS);

        if (Array.isArray(sort)) {
            newOptions.sort = sort.filter((e) => typeof e === "string" || e !== "");
        }
        if (typeof page === "number" && !isNaN(page)) {
            newOptions.page = page;
        }
        if (typeof pageSize === "number" && !isNaN(pageSize)) {
            newOptions.pageSize = pageSize;
        }
        if (typeof filter === "object" && !Array.isArray(filter)) {
            newOptions.filter = filter;
        }
        if (filterFunction === false || typeof filterFunction === "function") {
            newOptions.filterFunction = filterFunction;
        }

        if (!isEqual(this.#options, newOptions)) {
            this.#options = newOptions;
            this.triggerUpdate();
        }
    }

    updateOptions(value) {
        const {sort, page, pageSize, filter, filterFunction} = value;
        const newOptions = deepClone(this.#options);

        if (Array.isArray(sort)) {
            newOptions.sort = sort.filter((e) => typeof e === "string" || e !== "");
        }
        if (typeof page === "number" && !isNaN(page)) {
            newOptions.page = page;
        }
        if (typeof pageSize === "number" && !isNaN(pageSize)) {
            newOptions.pageSize = pageSize;
        }
        if (typeof filter === "object" && !Array.isArray(filter)) {
            newOptions.filter = filter;
        }
        if (filterFunction === false || typeof filterFunction === "function") {
            newOptions.filterFunction = filterFunction;
        }

        if (!isEqual(this.#options, newOptions)) {
            this.#options = newOptions;
            this.triggerUpdate();
        }
    }

    getOptions() {
        return deepClone(this.#options);
    }

    triggerUpdate = debounce(async () => {
        this.#data = await this.getData(this.#options);
        this.#gridEl.setData(this.#data);
        this.#updatePaginationEl();
    });

    #updatePaginationEl = debounce(() => {
        if (this.#paginationEl != null) {
            const pageSize = this.#options.pageSize;
            const currentPage = this.#options.page;
            const totalEntries = this.resultSize;
            this.#paginationEl.total = totalEntries;
            if (pageSize != null && pageSize > 0) {
                const maxPages = Math.ceil(totalEntries / pageSize);
                this.#paginationEl.size = pageSize;
                this.#paginationEl.max = maxPages;
                this.#paginationEl.value = (currentPage ?? 0) + 1;
            } else {
                this.#paginationEl.size = null;
                this.#paginationEl.max = 1;
                this.#paginationEl.value = 1;
            }
        }
    });

    async getData() {
        return [];
    }

}
