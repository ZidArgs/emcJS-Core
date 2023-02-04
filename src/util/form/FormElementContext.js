import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import LogicCompiler from "../logic/LogicCompiler.js";

const CONTEXTS = new WeakMap();
const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["visible"]
};

const mutationObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "attributes") {
            const target = mutation.target;
            const context = CONTEXTS.get(target);
            if (mutation.attributeName === "visible") {
                context.setVisibleLogic(JSON.parse(target.getAttribute("visible")));
            }
        }
    }
});

export default class FormElementContext {

    #element;

    #storage;

    #storageEventManager = new EventTargetManager();

    #visibleLogic;

    #visibleValue = true;

    static getContext(node) {
        return CONTEXTS.get(node) ?? new FormElementContext(node);
    }

    constructor(node) {
        if (CONTEXTS.has(node)) {
            throw new Error("context already exists");
        }
        if (!(node instanceof Node)) {
            throw new TypeError("FormElementContext can only work on Node");
        }
        this.#element = node;
        CONTEXTS.set(node, this);
        /* --- */
        mutationObserver.observe(node, MUTATION_CONFIG);
        /* --- */
        this.#storageEventManager.set(["load", "clear", "change"], () => {
            this.#callUpdateVisible();
        });
        /* --- */
        const visibleValue = node.getAttribute("visible");
        this.setVisibleLogic(JSON.parse(visibleValue));
    }

    set storage(value) {
        if (value != null && !(value instanceof ObservableStorage)) {
            throw new TypeError("ObservableStorage expected");
        }
        if (this.#storage != value) {
            this.#storage = value;
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
