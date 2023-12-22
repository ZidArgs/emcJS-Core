import {
    instanceOfOne
} from "./Class.js";

const STRUCTURED_CLONE_CLASSES = [
    Boolean, Number, String, RegExp, Date, Blob, File, FileList,
    ArrayBuffer, Int8Array, Uint8Array, Uint8ClampedArray,
    Int16Array, Uint16Array, Int32Array, Uint32Array,
    Float32Array, Float64Array, BigInt64Array, BigUint64Array,
    DataView, ImageBitmap, ImageData
];

export function deepClone(item) {
    return deepCloneItem(item);
}

function deepCloneItem(item, refs = new WeakMap()) {
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
    if (item instanceof Node) {
        const result = item.cloneNode(true);
        refs.set(item, result);
        return result;
    } else if (typeof item.clone === "function") {
        const result = item.clone();
        refs.set(item, result);
        return result;
    } else if (item instanceof Map) {
        const result = new Map();
        refs.set(item, result);
        for (const [key, value] of item) {
            result.set(key, deepCloneItem(value, refs));
        }
        return result;
    } else if (item instanceof Set) {
        const result = new Set();
        refs.set(item, result);
        for (const value of item) {
            result.add(deepCloneItem(value, refs));
        }
        return result;
    } else if (instanceOfOne(item, WeakMap, WeakSet)) {
        console.warn("WeakMap and WeakSet cloning is not possible due to their non iterable nature. ", item);
        return null;
    } else if (instanceOfOne(item, STRUCTURED_CLONE_CLASSES)) {
        const result = structuredClone(item);
        refs.set(item, result);
        return result;
    } else if (Array.isArray(item)) {
        const result = [];
        refs.set(item, result);
        for (const i in item) {
            const el = item[i];
            result.push(deepCloneItem(el, refs));
        }
        return result;
    } else if (typeof item.serialize === "function") {
        const result = item.serialize();
        refs.set(item, result);
        return result;
    }
    const result = {};
    refs.set(item, result);
    for (const i in item) {
        const el = item[i];
        result[i] = deepCloneItem(el, refs);
    }
    return result;
}
