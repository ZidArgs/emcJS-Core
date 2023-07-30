import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import AbstractFormField from "../../ui/form/abstract/AbstractFormField.js";
import FormContainer from "../../ui/form/FormContainer.js";
import {
    debounce
} from "../Debouncer.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import EventTargetManager from "../event/EventTargetManager.js";
import {
    extractFormData
} from "../helper/ui/Form.js";
import MutationObserverManager from "../observer/MutationObserverManager.js";
import FormElementContext from "./FormElementContext.js";
import FormFieldContext from "./FormFieldContext.js";

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
                        this.#registerNodeMutation(node);
                    }
                }
                for (const node of mutation.removedNodes) {
                    if (node instanceof HTMLElement) {
                        this.#unregisterNodeMutation(node);
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
        ev.errors = this.getErrors();
        ev.data = this.getFormFieldsData();
        ev.hiddenData = this.getFormHiddenData();
        ev.changes = this.#dataStorage.getChanges();
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
            const all = formEl.querySelectorAll("[name]");
            for (const node of all) {
                this.#registerNode(node);
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
        const all = formEl.querySelectorAll("[name]");
        for (const node of all) {
            this.#unregisterNode(node);
        }
        REGISTERED_FORMS.delete(formEl, this);
        this.#formElList.delete(formEl);
    }

    loadData(data) {
        this.#formEventManager.setActive(false);
        this.#dataStorage.deserialize(data);
        this.#formEventManager.setActive(true);
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

    getChanges() {
        return this.#dataStorage.getChanges();
    }

    getData() {
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

    getFormValidity() {
        for (const formEl of this.#formElList) {
            if (!formEl.checkValidity()) {
                return false;
            }
        }
        return true;
    }

    #registerNodeMutation(node) {
        if (node.matches("[name]")) {
            this.#registerNode(node);
        }
        const all = node.querySelectorAll("[name]");
        for (const subNode of all) {
            this.#registerNode(subNode);
        }
    }

    #unregisterNodeMutation(node) {
        if (node.matches("[name]")) {
            this.#unregisterNode(node);
        }
        const all = node.querySelectorAll("[name]");
        for (const subNode of all) {
            this.#unregisterNode(subNode);
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
        } else {
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
        } else {
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
