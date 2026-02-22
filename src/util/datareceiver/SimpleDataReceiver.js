import {
    isDict, isString
} from "../helper/CheckType.js";
import DataReceiverMixin from "./DataReceiverMixin.js";

export default class SimpleDataReceiver extends DataReceiverMixin(EventTarget) {

    #onDataCallback;

    constructor(onDataCallback) {
        super();
        if (typeof onDataCallback !== "function") {
            throw new Error("onDataCallback must be a function");
        }
        this.#onDataCallback = onDataCallback;
    }

    setData(data = []) {
        this.#onDataCallback(data);
    }

    refresh() {
        this.dispatchEvent(new Event("refresh"));
    }

    search(search) {
        if  (isString(search)) {
            const ev = new Event("search");
            ev.data = {search};
            this.dispatchEvent(ev);
        }
    }

    filter(filter) {
        if (isDict(filter)) {
            const ev = new Event("filter");
            ev.data = {filter};
            this.dispatchEvent(ev);
        }
    }

    sort(columnName) {
        if  (isString(columnName)) {
            const ev = new Event("sort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        }
    }

    unsort(columnName) {
        if  (isString(columnName)) {
            const ev = new Event("unsort");
            ev.data = {columnName};
            this.dispatchEvent(ev);
        }
    }

}
