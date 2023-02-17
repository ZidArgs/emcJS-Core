import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import AbstractFormField from "../../ui/form/abstract/AbstractFormField.js";
import FormContainer from "../../ui/form/FormContainer.js";
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

export default class FormContext extends EventTarget {

    #dataStorage = new ObservableStorage();

    #formListEventManager = new EventMultiTargetManager();

    #storageEventTargetManager = new EventTargetManager();

    #formElList = new Set();

    #ghostInvisible = false;

    #mutationObserver = new MutationObserverManager(MUTATION_CONFIG, (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type == "childList") {
                for (const node of mutation.addedNodes) {
                    this.#registerNode(node);
                }
                for (const node of mutation.removedNodes) {
                    this.#unregisterNode(node);
                }
            }
        }
    });

    constructor(initValues = {}) {
        super();
        this.#formListEventManager.set("validity", (event) => {
            const {name, valid} = event;
            if (!valid) {
                this.#dataStorage.delete(name);
            }
        });
        this.#formListEventManager.set("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            /* --- */
            const ev = new Event("submit");
            ev.changes = this.#dataStorage.getChanges();
            ev.data = this.#dataStorage.getAll();
            ev.formData = this.getFormData();
            this.dispatchEvent(ev);
        });
        this.#formListEventManager.set("reset", (event) => {
            this.#dataStorage.resetChanges();
            event.preventDefault();
            event.stopPropagation();
        });
        /* --- */
        this.#dataStorage.deserialize(initValues);
        this.#storageEventTargetManager.switchTarget(this.#dataStorage);
        this.#storageEventTargetManager.set("clear", (event) => {
            // this.#formListEventManager.setActive(false);
            // for (const formEl of this.#formElList) {
            //     formEl.reset();
            // }
            // this.#formListEventManager.setActive(true);
            /* --- */
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
        this.#formElList.add(formEl);
        this.#formListEventManager.addTarget(formEl);
        this.#mutationObserver.observe(formEl);
        const all = formEl.querySelectorAll("[name]");
        for (const el of all) {
            if (el instanceof AbstractFormField) {
                const context = FormFieldContext.getContext(el);
                context.storage = this.#dataStorage;
                context.ghostInvisible = this.#ghostInvisible;
            } else {
                const context = FormElementContext.getContext(el);
                context.storage = this.#dataStorage;
                context.ghostInvisible = this.#ghostInvisible;
            }
        }
    }

    unregisterForm(formEl) {
        if (!(formEl instanceof HTMLFormElement)) {
            throw new TypeError("HTMLFormElement expected");
        }
        this.#formElList.delete(formEl);
        this.#formListEventManager.removeTarget(formEl);
        this.#mutationObserver.unobserve(formEl);
        const all = formEl.querySelectorAll("[name]");
        for (const el of all) {
            if (el instanceof AbstractFormField) {
                const context = FormFieldContext.getContext(el);
                context.storage = null;
                context.ghostInvisible = false;
            } else {
                const context = FormElementContext.getContext(el);
                context.storage = null;
                context.ghostInvisible = false;
            }
        }
    }

    loadData(data) {
        this.#formListEventManager.setActive(false);
        this.#dataStorage.deserialize(data);
        this.#formListEventManager.setActive(true);
    }

    getChanges() {
        return this.#dataStorage.getChanges();
    }

    getData() {
        return this.#dataStorage.getAll();
    }

    getFormData() {
        const res = {};
        for (const formEl of this.#formElList) {
            const data = extractFormData(formEl);
            for (const key in data) {
                res[key] = data[key];
            }
        }
        return res;
    }

    getHiddenFormData() {
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

    #registerNode(node) {
        if (node instanceof AbstractFormField) {
            if (node.matches("[name]")) {
                FormFieldContext.getContext(node).storage = this.#dataStorage;
            }
            const all = node.querySelectorAll("[name]");
            for (const el of all) {
                if (el instanceof AbstractFormField) {
                    FormFieldContext.getContext(el).storage = this.#dataStorage;
                } else {
                    FormElementContext.getContext(el).storage = this.#dataStorage;
                }
            }
        }
    }

    #unregisterNode(node) {
        if (node instanceof AbstractFormField) {
            if (node.matches("[name]")) {
                FormFieldContext.getContext(node).storage = null;
            }
            const all = node.querySelectorAll("[name]");
            for (const el of all) {
                if (el instanceof AbstractFormField) {
                    FormFieldContext.getContext(el).storage = null;
                } else {
                    FormElementContext.getContext(el).storage = null;
                }
            }
        }
    }

}
