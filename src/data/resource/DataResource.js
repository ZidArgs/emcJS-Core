import {immute} from "../Immutable.js";
import {deepClone} from "../../util/helper/DeepClone.js";
import AbstractResource from "./AbstractResource.js";
import {getFromObjectByPath} from "../../util/helper/collection/ObjectContent.js";

export default class DataResource extends AbstractResource {

    #data = null;

    constructor(data) {
        super();
        const proxyData = immute(deepClone(data));
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
                return getFromObjectByPath(this.#data, path);
            }
            if (!!AbstractResource.pathSeparator && typeof path === "string" && path.includes(AbstractResource.pathSeparator)) {
                path = path.split(AbstractResource.pathSeparator);
                return getFromObjectByPath(this.#data, path);
            }
            return this.#data[path];
        }
        return this.#data;
    }

    get data() {
        return this.#data;
    }

}
