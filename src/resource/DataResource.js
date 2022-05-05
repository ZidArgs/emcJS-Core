import {
    immuteRecursive
} from "../data/Immutable.js";
import Helper from "../util/helper/Helper.js";

export default class DataResource extends EventTarget {

    #data = null;

    constructor(data) {
        super();
        const proxyData = immuteRecursive(Helper.deepClone(data));
        this.#data = proxyData;
        const ev = new Event("load");
        ev.data = proxyData;
        this.dispatchEvent(ev);
    }

    get loaded() {
        return true;
    }

    get(path) {
        if (typeof path == "string" && !!path) {
            return this.#data[path];
        } else {
            return this.#data;
        }
    }

}
