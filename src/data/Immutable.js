import {isNull} from "../util/helper/CheckType.js";

const TYPE_TAG = Symbol("Immutable");

const HANDLER = {
    get(target, prop) {
        if (prop === TYPE_TAG) {
            return true;
        }
        return target[prop];
    },
    set() {
        throw new Error("can not modify immutable object");
    },
    has(target, prop) {
        if (prop === TYPE_TAG) {
            return true;
        }
        return prop in target;
    },
    deleteProperty() {
        throw new Error("can not modify immutable object");
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
 * Create an immutable Objec.
 * Primitives and functions can not be immuted and will be returned as is.
 *
 * @param {*} target an object to immute
 * @returns {Proxy|Boolean|Number|String|Function|null|undefined} the immuted data
 */
export function immute(target) {
    return immuteInternal(target);
}

function immuteInternal(target, cache = new WeakMap()) {
    if (cache.has(target)) {
        return cache.get(target);
    }
    if (!isNull(target) && !target[TYPE_TAG]) {
        if (Array.isArray(target)) {
            const res = [];
            cache.set(target, res);
            for (const key in target) {
                const value = target[key];
                res[key] = immuteInternal(value, cache);
            }
            const proxy = new Proxy(res, HANDLER);
            return proxy;
        }
        if (target.constructor === Object) {
            const res = {};
            cache.set(target, res);
            for (const key in target) {
                const value = target[key];
                res[key] = immuteInternal(value, cache);
            }
            const proxy = new Proxy(res, HANDLER);
            return proxy;
        }
    }
    return target;
}

export function isImmutable(target) {
    return target?.[TYPE_TAG] ?? false;
}

export function canBeImmutable(target) {
    return !isNull(target) && (target.constructor === Object || Array.isArray(target));
}
