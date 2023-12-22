import {
    isEqual
} from "../../util/helper/Comparator.js";
import {
    deepClone
} from "../../util/helper/DeepClone.js";
import TypeValidator from "../../util/type/TypeValidator.js";

export default class TypeEntity extends EventTarget {

    #typeName;

    #entityName;

    #buffer = new Map();

    constructor(typeName, entityName, data = {}) {
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`typeName has to be a string that is not empty and not "*"`);
        }
        if (typeof entityName !== "string" || entityName === "") {
            throw new Error(`name has to be a string that is not empty`);
        }
        super();
        this.#typeName = typeName;
        this.#entityName = entityName;
        // validation
        const validationErrors = TypeValidator.validate(this.#typeName, data, {
            label: this.#entityName,
            strict: true
        });
        if (validationErrors.length > 0) {
            const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error deserializing data as "${this.#typeName}"\n    ${msg}`);
        }
        // write
        for (const [name, value] of Object.entries(data)) {
            this.#buffer.set(name, value);
        }
    }

    get type() {
        return this.#typeName;
    }

    set(key, value) {
        // validation
        const validationErrors = TypeValidator.validateAtPath(this.#typeName, key, value, {
            label: this.#entityName,
            strict: true
        });
        if (validationErrors.length > 0) {
            const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error setting value as "${key}" of "${this.#typeName}"\n    ${msg}`);
        }
        // write
        const oldValue = this.get(key);
        if (!isEqual(oldValue, value)) {
            this.#buffer.set(key, value);
            // event
            const ev = new Event("change");
            ev.data = {[key]: value};
            ev.changes = {[key]: {oldValue, newValue: value}};
            this.dispatchEvent(ev);
        }
    }

    get(key) {
        if (this.#buffer.has(key)) {
            return deepClone(this.#buffer.get(key));
        }
        return null;
    }

    serialize() {
        const res = {};
        for (const [name, value] of this.#buffer) {
            res[name] = deepClone(value);
        }
        return res;
    }

    deserialize(data = {}) {
        // validation
        const validationErrors = TypeValidator.validate(this.#typeName, data, {
            label: this.#entityName,
            strict: true
        });
        if (validationErrors.length > 0) {
            const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error deserializing data as "${this.#typeName}"\n    ${msg}`);
        }
        // write
        for (const [name, value] of Object.entries(data)) {
            this.#buffer.set(name, value);
        }
    }

}
