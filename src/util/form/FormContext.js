import FormContainer from "../../ui/form/FormContainer.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";

// TODO set all values for newly registered forms

export default class FormContext {

    #rootData = new Map();

    #changeData = new Map();

    #formListEventManager = new EventMultiTargetManager();

    #formElList = new Set();

    constructor() {
        this.#formListEventManager.set("value", (event) => {
            const {target, name, value} = event;
            /* --- */
            const convertedValue = value;
            if (this.#rootData.get(name) === convertedValue) {
                this.#changeData.delete(name);
                console.log("remove change", name);
            } else {
                this.#changeData.set(name, convertedValue);
                console.log("set change", name, convertedValue);
            }
            /* --- */
            for (const formEl of this.#formElList) {
                if (target.form === formEl) {
                    continue;
                }
                const elementList = formEl.querySelectorAll(`[name="${name}"]`);
                for (const element of elementList) {
                    element.value = value;
                }
            }
        });
    }

    registerForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("first argument is expected to be a FormContainer");
        }
        this.#formElList.add(formEl);
        this.#formListEventManager.addTarget(formEl);
    }

    unregisterForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("first argument is expected to be a FormContainer");
        }
        this.#formElList.delete(formEl);
        this.#formListEventManager.removeTarget(formEl);
    }

    // TODO set all values (in form) not only the new ones (?)
    // (technically reset form)
    setData(data) {
        this.#formListEventManager.setActive(false);
        for (const name in data) {
            const value = data[name];
            this.#rootData.set(name, value);
            for (const formEl of this.#formElList) {
                const elementList = formEl.querySelectorAll(`[name="${name}"]`);
                for (const element of elementList) {
                    element.value = value;
                }
            }
        }
        this.#changeData.clear();
        this.#formListEventManager.setActive(true);
    }

    clearChanges() {
        return this.#changeData.clear();
    }

    getChanges() {
        const res = {};
        for (const [key, value] of this.#changeData) {
            res[key] = value;
        }
        return res;
    }

    // XXX is this needeed?
    prepareForm(formEl) {
        this.#rootData.setAll(FormContext.#getFormData(formEl));
        /* --- */
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "attributes") {
                    const target = mutation.target;
                    this.#rootData.set(target.name, target.value);
                } else if (mutation.type == "childList") {
                    for (const element of mutation.addedNodes) {
                        this.#rootData.set(element.name, element.value);
                    }
                }
            }
        });
        observer.observe(formEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["value"]
        });
    }

    static #getFormData(formEl) {
        const result = {};
        const data = formEl.getData();
        for (const name in data) {
            const element = formEl.querySelector(`[name="${name}"]`);
            result[name] =  element.value;
        }
        return result;
    }

}
