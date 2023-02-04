import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import LogicCompiler from "../logic/LogicCompiler.js";

const ELEMENT_EVENTS = ["default", "value"];
const STORAGE_EVENTS = ["load", "clear", "change"];
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
                if (context.storage != null && context.storage.has(target.name)) {
                    target.value = context.storage.get(target.name);
                }
            } else if (mutation.attributeName === "visible") {
                context.setVisibleLogic(JSON.parse(target.getAttribute("visible")));
            }
        }
    }
});

export default class FieldContext {

    #element;

    #elementEventManager = new EventTargetManager();

    #storage;

    #storageEventManager = new EventTargetManager();

    #visibleLogic;

    #visibleValue = true;

    static getContext(node) {
        return CONTEXTS.get(node) ?? new FieldContext(node);
    }

    constructor(node) {
        if (CONTEXTS.has(node)) {
            throw new Error("context already exists");
        }
        if (!(node instanceof Element)) {
            throw new TypeError("Element expected");
        }
        this.#element = node;
        CONTEXTS.set(node, this);
        /* --- */
        mutationObserver.observe(node, MUTATION_CONFIG);
        this.#elementEventManager.switchTarget(node);
        this.#elementEventManager.set(ELEMENT_EVENTS, (event) => {
            this.#storageEventManager.setActive(false);
            const {name, value} = event;
            this.storage.set(name, value);
            this.#storageEventManager.setActive(true);
        });
        /* --- */
        this.#storageEventManager.set(STORAGE_EVENTS, (event) => {
            this.#elementEventManager.setActive(false);
            if (node.name in event.data) {
                node.value = event.data[node.name];
            }
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
            const elName = this.#element.name;
            if (value != null && value.has(elName)) {
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
