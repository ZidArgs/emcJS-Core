import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import FormContainer from "../../ui/form/FormContainer.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import EventTargetManager from "../event/EventTargetManager.js";
import MutationObserverManager from "../observer/MutationObserverManager.js";
import FieldContext from "./FieldContext.js";

const MUTATION_CONFIG = {
    childList: true,
    subtree: true
};

export default class FormContext extends EventTarget {

    #dataStorage = new ObservableStorage();

    #formListEventManager = new EventMultiTargetManager();

    #storageEventTargetManager = new EventTargetManager();

    #formElList = new Set();

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
        /* --- */
        this.#dataStorage.deserialize(initValues);
        this.#storageEventTargetManager.switchTarget(this.#dataStorage);
        this.#storageEventTargetManager.set("clear", (event) => {
            this.#formListEventManager.setActive(false);
            for (const formEl of this.#formElList) {
                formEl.reset();
            }
            this.#formListEventManager.setActive(true);
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

    registerForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        this.#formElList.add(formEl);
        this.#formListEventManager.addTarget(formEl);
        this.#mutationObserver.observe(formEl);
        const all = formEl.querySelectorAll("[name]");
        for (const el of all) {
            FieldContext.getContext(el).storage = this.#dataStorage;
        }
    }

    unregisterForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        this.#formElList.delete(formEl);
        this.#formListEventManager.removeTarget(formEl);
        this.#mutationObserver.unobserve(formEl);
        const all = formEl.querySelectorAll("[name]");
        for (const el of all) {
            FieldContext.getContext(el).storage = null;
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

    #registerNode(node) {
        if (node instanceof Element) {
            if (node.matches("[name]")) {
                FieldContext.getContext(node).storage = this.#dataStorage;
            }
            const all = node.querySelectorAll("[name]");
            for (const el of all) {
                FieldContext.getContext(el).storage = this.#dataStorage;
            }
        }
    }

    #unregisterNode(node) {
        if (node instanceof Element) {
            if (node.matches("[name]")) {
                FieldContext.getContext(node).storage = null;
            }
            const all = node.querySelectorAll("[name]");
            for (const el of all) {
                FieldContext.getContext(el).storage = null;
            }
        }
    }

}
