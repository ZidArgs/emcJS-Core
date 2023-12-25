import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import AbstractFormField from "../../ui/form/abstract/AbstractFormField.js";
import FormContainer from "../../ui/form/FormContainer.js";
import {
    debounce
} from "../Debouncer.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import EventTargetManager from "../event/EventTargetManager.js";
import {
    instanceOfOne
} from "../helper/Class.js";
import {
    elevateObject, getFromObjectByPath
} from "../helper/collection/ObjectContent.js";
import {
    extractFormData
} from "../helper/ui/Form.js";
import MutationObserverManager from "../observer/MutationObserverManager.js";
import FormElementContext from "./FormElementContext.js";
import FormFieldContext from "./FormFieldContext.js";

const FORM_ELEMENTS = [
    HTMLInputElement,
    HTMLSelectElement,
    HTMLTextAreaElement,
    HTMLButtonElement
];

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

const REGISTERED_FORMS = new WeakMap();

export default class FormContext extends EventTarget {

    #dataStorage = new ObservableStorage();

    #validators = new Set();

    #formElList = new Set();

    #formEventManager = new EventMultiTargetManager();

    #storageEventTargetManager = new EventTargetManager();

    #formFieldContextList = new Set();

    #ghostInvisible = false;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type == "childList") {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        this.#registerNodeRecursive(node);
                    }
                }
                for (const node of mutation.removedNodes) {
                    if (node instanceof HTMLElement) {
                        this.#unregisterNodeRecursive(node);
                    }
                }
            }
        }
    });

    constructor(initValues = {}) {
        super();
        this.#formEventManager.set("submit", (event) => {
            this.submit();
            event.preventDefault();
            event.stopPropagation();
        });
        this.#formEventManager.set("reset", (event) => {
            this.reset();
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#dataStorage.deserialize(initValues);
        this.#storageEventTargetManager.switchTarget(this.#dataStorage);
        this.#storageEventTargetManager.set("clear", (event) => {
            const ev = new Event("clear");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        this.#storageEventTargetManager.set("change", (event) => {
            const ev = new Event("change");
            ev.data = event.data;
            ev.changes = event.changes;
            this.dispatchEvent(ev);
        });
        this.#storageEventTargetManager.set("load", (event) => {
            const ev = new Event("load");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
    }

    async submit() {
        const errorFields = await this.revalidate();
        if (errorFields.length) {
            const ev = new Event("error");
            ev.errors = errorFields;
            this.dispatchEvent(ev);
            errorFields[0].element.focus();
            return;
        }
        /* --- */
        const ev = new Event("submit");
        ev.data = this.getData();
        ev.formData = this.getFormFieldsData();
        ev.hiddenData = this.getFormHiddenData();
        ev.changes = this.#dataStorage.getChanges();
        ev.errors = this.getErrors();
        this.dispatchEvent(ev);
    }

    addValidator(validator) {
        if (typeof validator === "function" && !this.#validators.has(validator)) {
            this.#validators.add(validator);
            this.revalidate();
        }
    }

    removeValidator(validator) {
        if (typeof validator === "function" && this.#validators.has(validator)) {
            this.#validators.remove(validator);
            this.revalidate();
        }
    }

    async revalidate() {
        const validations = [];
        for (const validator of this.#validators) {
            validations.push(this.#doGlobalValidation(validator));
        }
        for (const formEl of this.#formElList) {
            if (!formEl.noValidate) {
                for (const node of formEl.elements) {
                    if (node instanceof AbstractFormField) {
                        validations.push(this.#doFormFieldValidation(node));
                    } else if (!node.reportValidity()) {
                        validations.push(Promise.resolve({
                            name: node.name,
                            element: node,
                            errors: [node.validationMessage]
                        }));
                    }
                }
            }
        }
        const errors = await Promise.all(validations);
        return errors.filter((e) => e != null);
    }

    async #doGlobalValidation(validator) {
        const message = await validator(this.getFormFieldsData());
        if (typeof message === "string" && message !== "") {
            return {
                name: null,
                element: null,
                errors: [message]
            }
        }
    }

    async #doFormFieldValidation(fieldEl) {
        if (!fieldEl.noValidate) {
            const errors = await fieldEl.revalidate();
            if (errors.length) {
                return {
                    name: fieldEl.name,
                    element: fieldEl,
                    errors
                }
            }
        }
    }

    reset() {
        this.#dataStorage.resetChanges();
    }

    set ghostInvisible(value) {
        this.#ghostInvisible = !!value;
    }

    get ghostInvisible() {
        return this.#ghostInvisible;
    }

    registerFormContainer(formContainerEl) {
        if (!(formContainerEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        const allFormEls = formContainerEl.querySelectorAll("form");
        for (const formEl of allFormEls) {
            this.registerForm(formEl);
        }
    }

    unregisterFormContainer(formContainerEl) {
        if (!(formContainerEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        const allFormEls = formContainerEl.querySelectorAll("form");
        for (const formEl of allFormEls) {
            this.unregisterForm(formEl);
        }
    }

    registerForm(formEl) {
        if (!(formEl instanceof HTMLFormElement)) {
            throw new TypeError("HTMLFormElement expected");
        }
        if (!this.#formElList.has(formEl)) {
            if (REGISTERED_FORMS.has(formEl)) {
                throw new Error("form is already registered to another FormContext");
            }
            REGISTERED_FORMS.set(formEl, this);
            this.#formElList.add(formEl);
            this.#formEventManager.addTarget(formEl);
            this.#mutationObserver.observe(formEl);
            for (const node of formEl.children) {
                this.#registerNodeRecursive(node);
            }
        }
    }

    unregisterForm(formEl) {
        if (!(formEl instanceof HTMLFormElement)) {
            throw new TypeError("HTMLFormElement expected");
        }
        if (!this.#formElList.has(formEl)) {
            throw new Error("form is not registered to this FormContext");
        }
        this.#formEventManager.removeTarget(formEl);
        this.#mutationObserver.unobserve(formEl);
        for (const node of formEl.children) {
            this.#unregisterNodeRecursive(node);
        }
        REGISTERED_FORMS.delete(formEl, this);
        this.#formElList.delete(formEl);
    }

    loadData(data, merge = false) {
        setTimeout(() => {
            const res = {};
            for (const formEl of this.#formFieldContextList) {
                const name = formEl.node.name;
                if (name != null) {
                    const value = getFromObjectByPath(data, name.split("."));
                    if (value != null) {
                        res[name] = value;
                    }
                }
            }
            this.loadDataFlat(res, merge);
        }, 0);
    }

    loadDataFlat(data, merge = false) {
        this.#formEventManager.setActive(false);
        if (merge) {
            this.#dataStorage.setAll(data);
        } else {
            this.#dataStorage.deserialize(data);
        }
        this.#formEventManager.setActive(true);
    }

    getData() {
        return elevateObject(this.getDataFlat());
    }

    getDataFlat() {
        return this.#dataStorage.getAll();
    }

    getInternalFormData() {
        const res = {};
        for (const formEl of this.#formElList) {
            const data = extractFormData(formEl);
            for (const key in data) {
                res[key] = data[key];
            }
        }
        return res;
    }

    getFormFieldsData() {
        const res = {};
        for (const fieldEl of this.#formFieldContextList) {
            if (!fieldEl.node.disabled) {
                res[fieldEl.node.name] = fieldEl.node.getSubmitValue();
            }
        }
        return res;
    }

    getFormHiddenData() {
        const res = {};
        for (const formEl of this.#formElList) {
            const all = formEl.querySelectorAll("input[type=\"hidden\"][name]")
            for (const el of all) {
                const name = el.getAttribute("name");
                if (name != null) {
                    const value = el.getAttribute("value") ?? "";
                    res[name] = value;
                }
            }
        }
        return res;
    }

    getChanges() {
        return this.#dataStorage.getChanges();
    }

    getFormValidity() {
        for (const formEl of this.#formElList) {
            if (!formEl.checkValidity()) {
                return false;
            }
        }
        return true;
    }

    getErrors() {
        const res = [];
        for (const fieldEl of this.#formFieldContextList) {
            if (fieldEl.errors.length) {
                res.push({
                    name: fieldEl.node.name,
                    errors: fieldEl.errors,
                    element: fieldEl.node
                });
            }
        }
        return res;
    }

    #registerNodeRecursive(node) {
        this.#registerNode(node);
        for (const subNode of node.children) {
            this.#registerNodeRecursive(subNode);
        }
    }

    #unregisterNodeRecursive(node) {
        this.#unregisterNode(node);
        for (const subNode of node.children) {
            this.#unregisterNodeRecursive(subNode);
        }
    }

    #registerNode(node) {
        if (node instanceof AbstractFormField) {
            const context = FormFieldContext.getContext(node);
            context.storage = this.#dataStorage;
            context.ghostInvisible = this.#ghostInvisible;
            this.#formFieldContextList.add(context);
            node.addValidator(this.#doGlobalValidationFromField);
            node.formContextAssociatedCallback(this);
        } else if (instanceOfOne(node, ...FORM_ELEMENTS)) {
            const context = FormElementContext.getContext(node);
            context.storage = this.#dataStorage;
            context.ghostInvisible = this.#ghostInvisible;
        }
    }

    #unregisterNode(node) {
        if (node instanceof AbstractFormField) {
            const context = FormFieldContext.getContext(node);
            context.storage = null;
            context.ghostInvisible = false;
            this.#formFieldContextList.delete(context);
            node.removeValidator(this.#doGlobalValidationFromField);
        } else if (instanceOfOne(node, ...FORM_ELEMENTS)) {
            const context = FormElementContext.getContext(node);
            context.storage = null;
            context.ghostInvisible = false;
        }
    }

    #doGlobalValidationFromField = debounce(() => {
        for (const validator of this.#validators) {
            this.#doGlobalValidation(validator);
        }
    });

    findFields(callback) {
        const res = [];
        for (const fieldEl of this.#formFieldContextList) {
            if (callback(fieldEl.node)) {
                res.push(fieldEl.node);
            }
        }
        return res;
    }

    findFieldsByName(name) {
        const res = [];
        for (const fieldEl of this.#formFieldContextList) {
            if (fieldEl.node.name === name) {
                res.push(fieldEl.node);
            }
        }
        return res;
    }

    findFieldContexts(callback) {
        const res = [];
        for (const fieldEl of this.#formFieldContextList) {
            if (callback(fieldEl)) {
                res.push(fieldEl);
            }
        }
        return res;
    }

}
