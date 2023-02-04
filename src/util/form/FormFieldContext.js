import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import AbstractFormField from "../../ui/form/abstract/AbstractFormField.js";
import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import LogicCompiler from "../logic/LogicCompiler.js";

const CONTEXTS = new WeakMap();
const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["name", "visible"]
};

const mutationObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "attributes") {
            const target = mutation.target;
            const context = CONTEXTS.get(target);
            if (mutation.attributeName === "name") {
                if (context.storage != null) {
                    const elName = target.name;
                    const defaultValue = context.storage.getRootValue(elName);
                    if (defaultValue != null) {
                        target.setAttribute("value", defaultValue);
                    } else {
                        target.removeAttribute("value");
                    }
                    target.value = context.storage.get(elName);
                }
            } else if (mutation.attributeName === "visible") {
                context.setVisibleLogic(JSON.parse(target.getAttribute("visible")));
            }
        }
    }
});

export default class FormFieldContext {

    #element;

    #elementEventManager = new EventTargetManager();

    #storage;

    #storageEventManager = new EventTargetManager();

    #visibleLogic;

    #visibleValue = true;

    static getContext(node) {
        return CONTEXTS.get(node) ?? new FormFieldContext(node);
    }

    constructor(node) {
        if (CONTEXTS.has(node)) {
            throw new Error("context already exists");
        }
        if (!(node instanceof AbstractFormField)) {
            throw new TypeError("FormFieldContext can only work on AbstractFormField");
        }
        this.#element = node;
        CONTEXTS.set(node, this);
        /* --- */
        mutationObserver.observe(node, MUTATION_CONFIG);
        this.#elementEventManager.switchTarget(node);
        this.#elementEventManager.set("value", (event) => {
            this.#storageEventManager.setActive(false);
            const {name, value} = event;
            this.storage.set(name, value);
            this.#storageEventManager.setActive(true);
        });
        this.#elementEventManager.set("default", (event) => {
            this.#storageEventManager.setActive(false);
            const {name} = event;
            this.storage.resetValueChange(name);
            this.#storageEventManager.setActive(true);
        });
        /* --- */
        this.#storageEventManager.set("change", (event) => {
            this.#elementEventManager.setActive(false);
            if (node.name in event.data) {
                node.value = event.data[node.name];
            }
            this.#callUpdateVisible();
            this.#elementEventManager.setActive(true);
        });
        this.#storageEventManager.set(["load", "clear"], (event) => {
            this.#elementEventManager.setActive(false);
            const value = event.data[node.name];
            if (value != null) {
                node.setAttribute("value", value);
            } else {
                node.removeAttribute("value");
            }
            node.value = value;
            this.#callUpdateVisible();
            this.#elementEventManager.setActive(true);
        });
        /* --- */
        const visibleValue = node.getAttribute("visible");
        this.setVisibleLogic(JSON.parse(visibleValue));
    }

    set storage(value) {
        if (!(value instanceof ObservableStorage)) {
            throw new TypeError("ObservableStorage expected");
        }
        if (this.#storage != value) {
            this.#storage = value;
            if (value != null) {
                const elName = this.#element.name;
                const defaultValue = value.getRootValue(elName);
                if (defaultValue != null) {
                    this.#element.setAttribute("value", defaultValue);
                } else {
                    this.#element.removeAttribute("value");
                }
                this.#element.value = value.get(elName);
            }
            this.#storageEventManager.switchTarget(value);
            this.#callUpdateVisible();
        }
    }

    get storage() {
        return this.#storage;
    }

    get node() {
        return this.#element;
    }

    get visible() {
        return this.#visibleValue;
    }

    setVisibleLogic(logic) {
        this.#compileLogic(logic)
    }

    #compileLogic(logic) {
        if (logic != null && typeof logic === "object") {
            this.#visibleLogic = LogicCompiler.compile(logic);
            this.#callUpdateVisible();
        } else {
            const value = logic == null || !!logic;
            this.#visibleLogic = logic;
            this.#visibleValue = value;
            this.#element.style.display = value ? "" : "none";
        }
    }

    #callUpdateVisible() {
        if (typeof this.#visibleLogic === "function") {
            this.#updateVisible();
        }
    }

    #updateVisible = debounce(() => {
        if (typeof this.#visibleLogic === "function") {
            const value = this.#executeVisibleLogic();
            if (this.#visibleValue != value) {
                this.#visibleValue = value;
                this.#element.style.display = value ? "" : "none";
            }
        }
    });

    #executeVisibleLogic() {
        return !!this.#visibleLogic((key) => {
            return this.#getValue(key);
        });
    }

    #getValue(key) {
        return this.storage?.get(key);
    }

}
