import {
    immute
} from "../Immutable.js";
import Helper from "../../util/helper/Helper.js";
import AbstractResource from "./AbstractResource.js";

export default class DataResource extends AbstractResource {

    #data = null;

    constructor(data) {
        super();
        const proxyData = immute(Helper.deepClone(data));
        this.#data = proxyData;
        const ev = new Event("load");
        ev.data = proxyData;
        this.dispatchEvent(ev);
    }

    get loaded() {
        return true;
    }

    get(path) {
        if (this.#data != null && path != null) {
            if (Array.isArray(path)) {
                return Helper.getFromPath(this.#data, path);
            }
            if (!!AbstractResource.pathSeparator && typeof path === "string" && path.includes(AbstractResource.pathSeparator)) {
                path = path.split(AbstractResource.pathSeparator);
                return Helper.getFromPath(this.#data, path);
            }
            return this.#data[path];
        }
        return this.#data;
    }

    get data() {
        return this.#data;
    }

}
