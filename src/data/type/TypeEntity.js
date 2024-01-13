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

    #rootData = {};

    #buffer = {};

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
            label: this.#entityName
        });
        if (validationErrors.length > 0) {
            const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error deserializing data as "${this.#typeName}"\n    ${msg}`);
        }
        // write
        this.#rootData = deepClone(data);
        this.#buffer = deepClone(data);
    }

    get type() {
        return this.#typeName;
    }

    set(value) {
        if (value == null) {
            return;
        }
        // validation
        if (Object.keys(value).length) {
            const validationErrors = TypeValidator.validate(this.#typeName, value, {
                label: this.#entityName,
                strict: true
            });
            if (validationErrors.length > 0) {
                const msg = validationErrors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
                throw new Error(`Error validating value as "${this.#typeName}"\n    ${msg}`);
            }
        }
        // write
        const oldValue = this.#buffer;
        if (!isEqual(oldValue, value)) {
            this.#buffer = deepClone(value);
            // event
            const ev = new Event("change");
            ev.data = {[this.#entityName]: value};
            ev.changes = {[this.#entityName]: {oldValue, newValue: value}};
            this.dispatchEvent(ev);
        }
    }

    get() {
        return deepClone(this.#buffer);
    }

    clear() {
        const oldValue = this.#buffer;
        if (!isEqual(oldValue, {})) {
            this.#buffer = {};
            // event
            const ev = new Event("change");
            ev.data = {[this.#entityName]: {}};
            ev.changes = {[this.#entityName]: {oldValue, newValue: {}}};
            this.dispatchEvent(ev);
        }
    }

    hasChange() {
        return !isEqual(this.#rootData, this.#buffer);
    }

    flushChange() {
        this.#rootData = deepClone(this.#buffer);
    }

    purgeChange() {
        const newValue = this.#rootData;
        const oldValue = this.#buffer;
        if (!isEqual(oldValue, newValue)) {
            this.#buffer = deepClone(newValue);
            // event
            const ev = new Event("change");
            ev.data = {[this.#entityName]: newValue};
            ev.changes = {[this.#entityName]: {oldValue, newValue}};
            this.dispatchEvent(ev);
        }
    }

}
