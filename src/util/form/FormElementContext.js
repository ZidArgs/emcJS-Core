import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import AbstractFormElement from "../../ui/form/element/AbstractFormElement.js";
import {
    debounce
} from "../Debouncer.js";
import EventTargetManager from "../event/EventTargetManager.js";
import LogicCompiler from "../logic/processor/LogicCompiler.js";

const CONTEXTS = new WeakMap();
const MUTATION_CONFIG = {
    attributes: true,
    attributeFilter: ["name", "visible", "enabled", "editable"]
};

function applyDefaultValue(storage, target) {
    const elName = target.name;
    const defaultValue = storage.getRootValue(elName);
    if (defaultValue != null) {
        if (typeof value === "object") {
            target.setAttribute("value", JSON.stringify(defaultValue));
        } else {
            target.setAttribute("value", defaultValue);
        }
    } else if (target.hasAttribute("value")) {
        const value = target.getAttribute("value");
        try {
            storage.setRootValue(JSON.parse(value));
        } catch {
            storage.setRootValue(value);
        }
    }
}

const mutationObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "attributes") {
            const target = mutation.target;
            const context = CONTEXTS.get(target);
            if (mutation.attributeName === "name") {
                if (context.storage != null) {
                    applyDefaultValue(context.storage, target);
                    const elName = target.name;
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

export default class FormElementContext {

    #element;

    #elementEventManager = new EventTargetManager();

    #storage;

    #storageEventManager = new EventTargetManager();

    #visibleLogic;

    #visibleValue = true;

    #ghostInvisible = false;

    #enabledLogic;

    #enabledValue = true;

    #editableLogic;

    #editableValue = true;

    #hideErrors = null;

    #globalHideErrors = null;

    static getContext(node) {
        return CONTEXTS.get(node) ?? new FormElementContext(node);
    }

    constructor(node) {
        if (CONTEXTS.has(node)) {
            throw new Error("context already exists");
        }
        if (!(node instanceof AbstractFormElement)) {
            throw new TypeError("FormFieldContext can only work on AbstractFormElement");
        }
        this.#element = node;
        CONTEXTS.set(node, this);
        this.#hideErrors = node.hideErrors;
        /* --- */
        mutationObserver.observe(this.#element, MUTATION_CONFIG);
        this.#elementEventManager.switchTarget(this.#element);
        this.#elementEventManager.set("change", () => {
            if (this.#storage != null) {
                this.#storageEventManager.setActive(false);
                this.#storage.set(this.#element.name, this.#element.value);
                this.#storageEventManager.setActive(true);
            }
        });
        this.#elementEventManager.set("default", () => {
            if (this.#storage != null) {
                this.#storageEventManager.setActive(false);
                this.#storage.resetValueChange(this.#element.name);
                this.#storageEventManager.setActive(true);
            }
        });
        /* --- */
        this.#storageEventManager.set("change", (event) => {
            this.#elementEventManager.setActive(false);
            if (this.#element.name in event.data) {
                const value = event.data[this.#element.name];
                this.#element.value = value;
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
        const visibleLogicAttribute = this.#element.getAttribute("visible");
        this.setVisibleLogic(JSON.parse(visibleLogicAttribute));
        /* --- */
        const enabledLogicAttribute = this.#element.getAttribute("enabled");
        this.setEnabledLogic(JSON.parse(enabledLogicAttribute));
        /* --- */
        const editableLogicAttribute = this.#element.getAttribute("editable");
        this.setEditableLogic(JSON.parse(editableLogicAttribute));
    }

    set storage(value) {
        if (value != null && !(value instanceof ObservableStorage)) {
            throw new TypeError("ObservableStorage expected");
        }
        if (this.#storage != value) {
            this.#storage = value;
            if (value != null) {
                applyDefaultValue(value, this.#element);
                const elName = this.#element.name;
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

    set hideErrors(value) {
        if (value != null) {
            value = !!value;
        }
        if (this.#hideErrors !== value) {
            this.#hideErrors = value;
            if (this.#globalHideErrors == null) {
                this.#element.hideErrors = value;
            }
        }
    }

    get hideErrors() {
        return this.#hideErrors;
    }

    set globalHideErrors(value) {
        if (value != null) {
            value = !!value;
        }
        if (this.#globalHideErrors !== value) {
            this.#globalHideErrors = value;
            if (value != null) {
                this.#element.hideErrors = value;
            } else {
                this.#element.hideErrors = this.#hideErrors;
            }
        }
    }

    get globalHideErrors() {
        return this.#globalHideErrors;
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
            const value = this.#executeEnabledLogic();
            this.#setEnabledValue(value);
        }
    });

    #executeEnabledLogic() {
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

    /* editable logic */
    get editable() {
        return this.#editableValue;
    }

    setEditableLogic(logic) {
        if (logic != null && typeof logic === "object") {
            this.#editableLogic = LogicCompiler.compile(logic);
            this.#callUpdateEditable();
        } else {
            const value = logic == null || !!logic;
            this.#editableLogic = logic;
            this.#setEditableValue(value);
        }
    }

    #callUpdateEditable() {
        if (typeof this.#editableLogic === "function") {
            this.#updateEditable();
        }
    }

    #updateEditable = debounce(() => {
        if (typeof this.#editableLogic === "function") {
            const value = this.#executeEditableLogic();
            this.#setEditableValue(value);
        }
    });

    #executeEditableLogic() {
        return !!this.#editableLogic((key) => {
            return this.#getValue(key);
        });
    }

    #setEditableValue(value) {
        if (this.#editableValue != value) {
            this.#editableValue = value;
            if (value) {
                this.#element.removeAttribute("readonly");
            } else {
                this.#element.setAttribute("readonly", "");
            }
        }
    }

    /* logic helper */
    #getValue(key) {
        return this.storage?.get(key);
    }

}
