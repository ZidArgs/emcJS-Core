import {getFromObjectByPath} from "../../util/helper/collection/ObjectContent.js";
import {immute} from "../Immutable.js";
import AbstractResource from "./AbstractResource.js";

const RESOURCES = new Map();

export default class FileResource extends AbstractResource {

    #loaded = false;

    #data = null;

    constructor(src, content) {
        if (src == null) {
            throw new Error("resource must have a path associated with it");
        }
        if (RESOURCES.has(src)) {
            return RESOURCES.get(src);
        }
        super();
        RESOURCES.set(src, this);
        // ---
        if (content instanceof Promise) {
            content.then((data) => {
                this.#loaded = true;
                const proxyData = immute(data);
                this.#data = proxyData;
                // ---
                const ev = new Event("load");
                ev.data = proxyData;
                this.dispatchEvent(ev);
            }).catch((err) => {
                this.#loaded = true;
                // ---
                console.warn(err);
                const ev = new Event("error");
                this.dispatchEvent(ev);
            });
        } else {
            this.#loaded = true;
            const proxyData = immute(content);
            this.#data = proxyData;
            // ---
            const ev = new Event("load");
            ev.data = proxyData;
            this.dispatchEvent(ev);
        }
    }

    awaitReady() {
        return new Promise((resolve) => {
            if (this.#loaded) {
                resolve(this);
            } else {
                const handler = ()=> {
                    this.removeEventListener("load", handler);
                    this.removeEventListener("error", handler);
                    resolve(this);
                };
                this.addEventListener("load", handler);
                this.addEventListener("error", handler);
            }
        });
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

    static get(src) {
        return new Promise((resolve, reject) => {
            try {
                if (this === FileResource) {
                    throw new Error("can not get directly from FileResource");
                }
                const resource = RESOURCES.get(src) ?? new this(src);
                resource.awaitReady().then(() => {
                    resolve(resource);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

}
