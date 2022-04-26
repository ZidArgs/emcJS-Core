const RESOURCES = new Map();

export default class FileResource extends EventTarget {

    #loaded = false;

    constructor(src) {
        if (new.target === FileResource) {
            throw new TypeError("can not construct abstract class");
        }
        if (src == null) {
            throw new Error("resource must have a path associated with it");
        }
        if (RESOURCES.has(src)) {
            return RESOURCES.get(src);
        }
        super();
        RESOURCES.set(src, this);
        this.addEventListener("load", () => {
            this.#loaded = true;
        });
        this.addEventListener("error", () => {
            console.warn(`error loading resource "${src}"`);
            this.#loaded = true;
        });
    }

    awaitReady() {
        return new Promise((resolve, reject) => {
            if (this.#loaded) {
                resolve();
            } else {
                this.addEventListener("load", () => {
                    resolve();
                });
                this.addEventListener("error", () => {
                    resolve();
                });
            }
        });
    }

    static get(src) {
        return new Promise((resolve, reject) => {
            const resource = RESOURCES.get(src) ?? new this(src);
            resource.awaitReady().then(() => {
                resolve(resource);
            });
        });
    }

}
