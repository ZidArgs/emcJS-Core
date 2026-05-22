import CloneCache from "../../data/CloneCache.js";
import {instanceOfOne} from "./Class.js";

const NODE_SUPPORTED = "Node" in globalThis;

const STRUCTURED_CLONE_CLASSES = [
    Boolean,
    Number,
    String,
    RegExp,
    Date,
    ArrayBuffer,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
    DataView
];

if ("Blob" in globalThis) {
    STRUCTURED_CLONE_CLASSES.push(Blob);
}
if ("File" in globalThis) {
    STRUCTURED_CLONE_CLASSES.push(File);
}
if ("FileList" in globalThis) {
    STRUCTURED_CLONE_CLASSES.push(FileList);
}
if ("ImageBitmap" in globalThis) {
    STRUCTURED_CLONE_CLASSES.push(ImageBitmap);
}
if ("ImageData" in globalThis) {
    STRUCTURED_CLONE_CLASSES.push(ImageData);
}

export function deepClone(item) {
    return deepCloneItem(item);
}

function deepCloneItem(item, refs = new CloneCache()) {
    if (item != null) {
        if (typeof item === "object") {
            if (refs.has(item)) {
                return refs.get(item);
            }
            return deepCloneObject(item, refs);
        } else if (typeof item === "boolean") {
            return Boolean(item);
        } else if (typeof item === "number") {
            return Number(item);
        } else if (typeof item === "string") {
            return String(item);
        }
    }
    return item;
}

function deepCloneObject(item, refs) {
    if (typeof item.clone === "function") {
        return refs.set(item, item.clone());
    } else if (typeof item.serialize === "function") {
        return refs.set(item, item.serialize());
    } else if (NODE_SUPPORTED && item instanceof Node) {
        return refs.set(item, item.cloneNode(true));
    } else if (item instanceof Map) {
        const result = refs.set(item, new Map());
        for (const [key, value] of item) {
            result.set(key, deepCloneItem(value, refs));
        }
        return result;
    } else if (item instanceof Set) {
        const result = refs.set(item, new Set());
        for (const value of item) {
            result.add(deepCloneItem(value, refs));
        }
        return result;
    } else if (instanceOfOne(item, WeakMap, WeakSet)) {
        console.warn("WeakMap and WeakSet cloning is not possible due to their non iterable nature. ", item);
        return refs.set(item, null);
    } else if (item instanceof WeakRef) {
        return refs.set(item, deepCloneItem(item.deref()));
    } else if (instanceOfOne(item, STRUCTURED_CLONE_CLASSES)) {
        return refs.set(item, structuredClone(item));
    } else if (Array.isArray(item)) {
        const result = refs.set(item, new Array(item.length));
        for (const i in item) {
            result[i] = deepCloneItem(item[i], refs);
        }
        return result;
    }
    // must be an object
    const result = refs.set(item, {});
    for (const key in item) {
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
        }
        result[key] = deepCloneItem(item[key], refs);
    }
    for (const symbol of Object.getOwnPropertySymbols(item)) {
        result[symbol] = deepCloneItem(item[symbol], refs);
    }
    return result;
}
