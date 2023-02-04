import CustomFormElement from "../../ui/element/CustomFormElement.js";
import CustomFormElementDelegating from "../../ui/element/CustomFormElementDelegating.js";
import {
    instanceOfOne
} from "../../util/helper/Class.js";

const EXPECTED_CLASSES = [
    HTMLInputElement,
    HTMLButtonElement,
    CustomFormElement,
    CustomFormElementDelegating
];

class FormElementRegistry {

    #registry = new Map();

    create(ref, params) {
        const Clazz = this.#getClass(ref);
        if (Clazz != null) {
            if ("fromConfig" in Clazz) {
                return Clazz.fromConfig(params);
            }
            const el = new Clazz();
            for (const name in params) {
                const value = params[name];
                if (value != null) {
                    if (typeof value === "object") {
                        el.setAttribute(name, JSON.stringify(value));
                    } else {
                        el.setAttribute(name, value);
                    }
                } else {
                    el.removeAttribute(name);
                }
            }
            return el;
        }
        /* --- */
        console.warn(`FormElementRegistry: no form element registered for type "${ref}"`);
        const el = document.createElement("input");
        el.setAttribute("type", "hidden");
        el.setAttribute("name", params.name ?? "");
        if (typeof value === "object") {
            el.setAttribute("value", JSON.stringify(params.value ?? ""));
        } else {
            el.setAttribute("value", params.value ?? "");
        }
        return el;
    }

    #getClass(ref) {
        if (typeof ref === "string" && ref !== "") {
            return this.#registry.get(ref);
        }
    }

    register(ref, FormElementClass) {
        if (typeof ref !== "string" || ref === "") {
            throw new TypeError("ref must be a non empty string");
        }
        if (!instanceOfOne(FormElementClass.prototype, ...EXPECTED_CLASSES)) {
            throw new TypeError(`registered types must inherit from one of [${EXPECTED_CLASSES.map((c) => c.name).join(", ")}]`);
        }
        if (this.#registry.has(ref)) {
            throw new Error(`type "${ref}" already registered`);
        }
        this.#registry.set(ref, FormElementClass);
        return this;
    }

}

export default new FormElementRegistry();
