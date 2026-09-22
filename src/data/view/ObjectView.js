import {
    isNull
} from "../../util/helper/CheckType.js";

const TYPE_TAG = Symbol("ObjectView");

const CACHE = new WeakMap();

const HANDLER = {
    get(target, prop) {
        if (prop === TYPE_TAG) {
            return true;
        }
        const value = target[prop];
        if (CACHE.has(value)) {
            return CACHE.get(value);
        }
        if (!(target instanceof ObjectView) && ObjectView.canBeViewed(value)) {
            const proxy = new Proxy(value, HANDLER);
            CACHE.set(value, proxy);
            return target[prop] = proxy;
        }
        return value;
    },
    set() {
        throw new TypeError("view can not write to object");
    },
    has(target, prop) {
        if (prop === TYPE_TAG) {
            return true;
        }
        return prop in target;
    },
    deleteProperty() {
        throw new TypeError("view can not write to object");
    },
    defineProperty() {
        return false;
    },
    isExtensible() {
        return false;
    },
    preventExtensions() {
        return false;
    },
    setPrototypeOf() {
        return false;
    }
};

/**
 * An Object wrapper only allowing property access.
 * Can be used to prevent overriding of property contents.
 *
 * Only works with Dicts and Arrays, everything else will be
 * returned as is.
 *
 * The result will not be detached from its source, reflecting all changes.
 */
export default class ObjectView {

    /**
     * Create a new wrapper to prevent altering of the content.
     *
     * @param {*} target an Object that should be protected
     */
    constructor(target) {
        if (!(target instanceof ObjectView) && ObjectView.canBeViewed(target)) {
            const proxy = new Proxy(target, HANDLER);
            CACHE.set(target, proxy);
            return proxy;
        }
        return target;
    }

    static [Symbol.hasInstance](instance) {
        return instance?.[TYPE_TAG] ?? false;
    }

    static canBeViewed(target) {
        return !isNull(target) && (target.constructor === Object || Array.isArray(target));
    }

}
