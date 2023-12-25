import {
    deepClone
} from "../../helper/DeepClone.js";
import {
    isEqual
} from "../../helper/Comparator.js";
import {
    debounce
} from "../../Debouncer.js";
import DataGrid from "../../../ui/grid/DataGrid.js";

const DEFAULT_OPTIONS = {sort: [], page: 0, pageSize: 0, filter: {}, filterFunction: false};

export default class AbstractDataProvider {

    static get defaultOptions() {
        return deepClone(DEFAULT_OPTIONS);
    }

    #target;

    #options = DEFAULT_OPTIONS;

    constructor(target) {
        if (new.target === AbstractDataProvider) {
            throw new Error("can not construct abstract class");
        }
        if (!(target instanceof DataGrid)) {
            throw new Error("target must be an instance of DataGrid");
        }
        this.#target = target;
        this.triggerUpdate();
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
        const data = await this.getData(this.#options);
        this.#target.setData(data);
    });

    async getData() {
        return [];
    }

}
