import {
    immuteRecursive
} from "../data/Immutable.js";

const RESOURCES = new Map();

let PATH_SEPARATOR = "/";

export default class FileResource extends EventTarget {

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
            content.then(data => {
                this.#loaded = true;
                const proxyData = immuteRecursive(data);
                this.#data = proxyData;
                // ---
                const ev = new Event("load");
                ev.data = proxyData;
                this.dispatchEvent(ev);
            }).catch(err => {
                this.#loaded = true;
                // ---
                console.warn(err);
                const ev = new Event("error");
                this.dispatchEvent(ev);
            });
        } else {
            this.#loaded = true;
            const proxyData = immuteRecursive(content);
            this.#data = proxyData;
            // ---
            const ev = new Event("load");
            ev.data = proxyData;
            this.dispatchEvent(ev);
        }
    }

    awaitReady() {
        return new Promise((resolve, reject) => {
            if (this.#loaded) {
                resolve(this);
            } else {
                this.addEventListener("load", () => {
                    resolve(this);
                });
                this.addEventListener("error", () => {
                    resolve(this);
                });
            }
        });
    }

    #getFromPathArray(path) {
        path = Array.from(path);
        let current = this.#data;
        while (current != null && path.length) {
            current = current[path.shift()];
        }
        return current;
    }

    get(path) {
        if (this.#data != null && path != null) {
            if (Array.isArray(path)) {
                return this.#getFromPathArray(Array.from(path));
            }
            if (!!PATH_SEPARATOR && typeof path === "string" && path.includes(PATH_SEPARATOR)) {
                return this.#getFromPathArray(path.split(PATH_SEPARATOR));
            }
            return this.#data[path];
        }
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

    static set pathSeparator(value) {
        if (typeof value === "string") {
            PATH_SEPARATOR = value;
        } else {
            throw new TypeError(`expected type "string" but was "${typeof value}"`);
        }
    }

    static get pathSeparator() {
        return PATH_SEPARATOR;
    }

}
