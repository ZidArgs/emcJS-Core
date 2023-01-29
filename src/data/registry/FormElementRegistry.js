import CustomFormElement from "../../ui/element/CustomFormElement.js";
import CustomFormElementDelegating from "../../ui/element/CustomFormElementDelegating.js";
import Helper from "../../util/helper/Helper.js";

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
                    el.setAttribute(name, value);
                }
            }
            return el;
        }
        /* --- */
        console.warn(`FormElementRegistry: no form element registered for type "${ref}"`);
        const el = document.createElement("input");
        el.setAttribute("type", "hidden");
        el.setAttribute("name", params.name ?? "");
        el.setAttribute("value", params.value ?? "");
        return el;
    }

    #getClass(ref) {
        if (typeof ref == "string" && ref) {
            if (this.#registry.has(ref)) {
                return this.#registry.get(ref);
            }
        }
    }

    register(ref, RegClass) {
        if (!Helper.instanceOfOne(RegClass.prototype, ...EXPECTED_CLASSES)) {
            throw new TypeError(`registered types must inherit from one of [${EXPECTED_CLASSES.map((c) => c.name).join(", ")}]`);
        }
        if (this.#registry.has(ref)) {
            throw new Error(`type "${ref}" already registered`);
        }
        this.#registry.set(ref, RegClass);
        return this;
    }

}

export default new FormElementRegistry();
