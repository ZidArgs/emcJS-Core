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
    attributeFilter: ["name", "visible", "enabled"]
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
                        if (typeof value === "object") {
                            target.setAttribute("value", JSON.stringify(defaultValue));
                        } else {
                            target.setAttribute("value", defaultValue);
                        }
                    } else {
                        target.removeAttribute("value");
                    }
                    target.value = context.storage.get(elName);
                }
            } else if (mutation.attributeName === "visible") {
                context.setVisibleLogic(JSON.parse(target.getAttribute("visible")));
            } else if (mutation.attributeName === "enabled") {
                context.setEnabledLogic(JSON.parse(target.getAttribute("enabled")));
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

    #ghostInvisible = false;

    #enabledLogic;

    #enabledValue = true;

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
        mutationObserver.observe(this.#element, MUTATION_CONFIG);
        this.#elementEventManager.switchTarget(this.#element);
        this.#elementEventManager.set("change", () => {
            this.#storageEventManager.setActive(false);
            this.#storage.set(this.#element.name, this.#element.value);
            this.#storageEventManager.setActive(true);
        });
        this.#elementEventManager.set("default", (event) => {
            this.#storageEventManager.setActive(false);
            const {name} = event;
            this.#storage.resetValueChange(name);
            this.#storageEventManager.setActive(true);
        });
        /* --- */
        this.#storageEventManager.set("change", (event) => {
            this.#elementEventManager.setActive(false);
            if (this.#element.name in event.data) {
                this.#element.value = event.data[this.#element.name];
            }
            this.#callUpdateVisible();
            this.#callUpdateEnabled();
            this.#elementEventManager.setActive(true);
        });
        this.#storageEventManager.set(["load", "clear"], (event) => {
            this.#elementEventManager.setActive(false);
            const value = event.data[this.#element.name];
            if (value != null) {
                if (typeof value === "object") {
                    this.#element.setAttribute("value", JSON.stringify(value));
                } else {
                    this.#element.setAttribute("value", value);
                }
            } else {
                this.#element.removeAttribute("value");
            }
            this.#element.value = value;
            this.#callUpdateVisible();
            this.#callUpdateEnabled();
            this.#elementEventManager.setActive(true);
        });
        /* --- */
        const visibleValue = this.#element.getAttribute("visible");
        this.setVisibleLogic(JSON.parse(visibleValue));
        /* --- */
        const enabledValue = this.#element.getAttribute("enabled");
        this.setEnabledLogic(JSON.parse(enabledValue));
    }

    set storage(value) {
        if (value != null && !(value instanceof ObservableStorage)) {
            throw new TypeError("ObservableStorage expected");
        }
        if (this.#storage != value) {
            this.#storage = value;
            if (value != null) {
                const elName = this.#element.name;
                const defaultValue = value.getRootValue(elName);
                if (defaultValue != null) {
                    if (typeof defaultValue === "object") {
                        this.#element.setAttribute("value", JSON.stringify(defaultValue));
                    } else {
                        this.#element.setAttribute("value", defaultValue);
                    }
                } else {
                    this.#element.removeAttribute("value");
                }
                this.#element.value = value.get(elName);
            }
            this.#storageEventManager.switchTarget(value);
            this.#callUpdateVisible();
            this.#callUpdateEnabled();
        }
    }

    get storage() {
        return this.#storage;
    }

    get node() {
        return this.#element;
    }

    async revalidate() {
        return await this.#element.revalidate();
    }

    addValidator(validator) {
        this.#element.addValidator(validator);
    }

    removeValidator(validator) {
        this.#element.removeValidator(validator);
    }

    get errors() {
        return this.#element.errors;
    }

    /* visible logic */
    get visible() {
        return this.#visibleValue;
    }

    set ghostInvisible(value) {
        this.#ghostInvisible = !!value;
    }

    get ghostInvisible() {
        return this.#ghostInvisible;
    }

    setVisibleLogic(logic) {
        if (logic != null && typeof logic === "object") {
            this.#visibleLogic = LogicCompiler.compile(logic);
            this.#callUpdateVisible();
        } else {
            const value = logic == null || !!logic;
            this.#visibleLogic = logic;
            this.#setVisibileValue(value);
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
            this.#setVisibileValue(value);
        }
    });

    #executeVisibleLogic() {
        return !!this.#visibleLogic((key) => {
            return this.#getValue(key);
        });
    }

    #setVisibileValue(value) {
        if (this.#visibleValue != value) {
            this.#visibleValue = value;
            if (this.#ghostInvisible) {
                if (value) {
                    this.#element.style.opacity = "";
                } else {
                    this.#element.style.opacity = "0.2";
                }
            } else if (value) {
                this.#element.style.display = "";
            } else {
                this.#element.style.display = "none";
            }
        }
    }

    /* enabled logic */
    get enabled() {
        return this.#enabledValue;
    }

    setEnabledLogic(logic) {
        if (logic != null && typeof logic === "object") {
            this.#enabledLogic = LogicCompiler.compile(logic);
            this.#callUpdateEnabled();
        } else {
            const value = logic == null || !!logic;
            this.#enabledLogic = logic;
            this.#setEnabledValue(value);
        }
    }

    #callUpdateEnabled() {
        if (typeof this.#enabledLogic === "function") {
            this.#updateEnabled();
        }
    }

    #updateEnabled = debounce(() => {
        if (typeof this.#enabledLogic === "function") {
            const value = this.#executeEnabledeLogic();
            this.#setEnabledValue(value);
        }
    });

    #executeEnabledeLogic() {
        return !!this.#enabledLogic((key) => {
            return this.#getValue(key);
        });
    }

    #setEnabledValue(value) {
        if (this.#enabledValue != value) {
            this.#enabledValue = value;
            if (value) {
                this.#element.removeAttribute("disabled");
            } else {
                this.#element.setAttribute("disabled", "");
            }
        }
    }

    /* logic helper */
    #getValue(key) {
        return this.storage?.get(key);
    }

}
