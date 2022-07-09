import NumberHelper from "./NumberHelper.js";
import StringHelper from "./StringHelper.js";
import ArrayHelper from "./ArrayHelper.js";
import ObjectHelper from "./ObjectHelper.js";

const STRUCTURED_CLONE_CLASSES = [
    Boolean, Number, String, RegExp, Date, Blob, File, FileList,
    ArrayBuffer, Int8Array, Uint8Array, Uint8ClampedArray,
    Int16Array, Uint16Array, Int32Array, Uint32Array,
    Float32Array, Float64Array, BigInt64Array, BigUint64Array,
    DataView, ImageBitmap, ImageData
];

const EVENT_TAGNAMES = {
    "select":"input",
    "change":"input",
    "submit":"form",
    "reset":"form",
    "error":"img",
    "load":"img",
    "abort":"img"
};

class Helper {

    get Number() {
        return NumberHelper;
    }

    get String() {
        return StringHelper;
    }

    get Array() {
        return ArrayHelper;
    }

    get Object() {
        return ObjectHelper;
    }

    instanceOfOne(obj, ...classList) {
        if (Array.isArray(classList[0])) {
            classList = classList[0];
        }
        for (const clazz of classList) {
            if (obj instanceof clazz) {
                return true;
            }
        }
        return false;
    }

    allInstanceOf(clazz = Object, ...objList) {
        if (objList.length == 1 && Array.isArray(objList[0])) {
            objList = objList[0];
        }
        for (const obj of objList) {
            if (!(obj instanceof clazz)) {
                return false;
            }
        }
        return true;
    }

    compareVersions(a = "", b = "", s = ".") {
        const c = a.split(s);
        const d = b.split(s);
        let e = parseInt(c.shift());
        let f = parseInt(d.shift());
        while (!!e && !!f) {
            if (e != f) {
                return e < f;
            }
            e = parseInt(c.shift());
            f = parseInt(d.shift());
        }
        return !!f;
    }

    isEqual(a, b) {
        if (Object.is(a, b)) {
            return true;
        }
        if (typeof a != "object") {
            return false;
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() == b.getTime();
        }
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length != b.length) {
                return false;
            }
            return a.every((i, j) => this.isEqual(i, b[j]));
        }
        if (Array.isArray(b)) {
            return false;
        }
        const c = Object.keys(a);
        if (c.length != Object.keys(b).length) {
            return false;
        }
        return c.every((i) => b[i] != null && this.isEqual(a[i], b[i]));
    }

    deepClone(item) {
        return this.#deepClone(item);
    }

    #deepClone(item, refs = new WeakMap()) {
        if (item != null) {
            if (typeof item === "object") {
                if (refs.has(item)) {
                    return refs.get(item);
                }
                return this.#deepCloneObject(item, refs);
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

    #deepCloneObject(item, refs) {
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
                result.set(key, this.#deepClone(value, refs));
            }
            return result;
        } else if (item instanceof Set) {
            const result = new Set();
            refs.set(item, result);
            for (const value of item) {
                result.add(this.#deepClone(value, refs));
            }
            return result;
        } else if (this.instanceOfOne(item, WeakMap, WeakSet)) {
            console.warn("WeakMap and WeakSet cloning is not possible due to their non iterable nature. ", item);
            return null;
        } else if (this.instanceOfOne(item, STRUCTURED_CLONE_CLASSES)) {
            const result = structuredClone(item);
            refs.set(item, result);
            return result;
        } else if (Array.isArray(item)) {
            const result = [];
            refs.set(item, result);
            for (const i in item) {
                const el = item[i];
                result.push(this.#deepClone(el, refs));
            }
            return result;
        }
        const result = {};
        refs.set(item, result);
        for (const i in item) {
            const el = item[i];
            result[i] = this.#deepClone(el, refs);
        }
        return result;
    }

    isClass(obj) {
        if (obj == null) {
            return false;
        }
        const isClass = this.#isClassDefinition(obj);
        if (obj.prototype == null) {
            return isClass;
        }
        const isProtoClass = this.#isClassDefinition(obj.prototype);
        return isClass || isProtoClass;
    }

    #isClassDefinition(obj) {
        return obj.constructor?.toString().slice(0, 5) === "class";
    }

    getFromPath(obj, path) {
        if (typeof obj !== "object") {
            throw new TypeError("first parameter must be an object");
        }
        if (!Array.isArray(path)) {
            throw new TypeError("second parameter must be an array");
        }
        path = Array.from(path);
        while (obj != null && path.length) {
            obj = obj[path.shift()];
        }
        return obj;
    }

    isEventSupported(eventName) {
        const el = document.createElement(EVENT_TAGNAMES[eventName] || "div");
        const onEventName = `on${eventName}`;
        const isSupported = onEventName in el;
        if (!isSupported) {
            el.setAttribute(onEventName, "return;");
            return typeof el[onEventName] === "function";
        }
        return isSupported;
    }

}

export default new Helper;
