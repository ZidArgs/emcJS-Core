import FormElementRegistry from "../../data/registry/FormElementRegistry.js";
import Helper from "../helper/Helper.js";
import "../../ui/form/FormContainer.js";
import "../../ui/form/FormFieldset.js";
import "../../ui/form/button/SubmitButton.js";
import "../../ui/form/button/ResetButton.js";
import "../../ui/form/button/ActionButton.js";
import "../../ui/form/button/LinkButton.js";

/*
       NOW          :    BEFORE
    "SubmitButton"  : new
    "ResetButton"   : new
    "ActionButton"  : "button"
    "LinkButton"    : new
    "SwitchInput"   : "check"
    "StringInput"   : "string"
    "NumberInput"   : "number"
    "RangeInput"    : "range"
    "ColorInput"    : "color"
    "PasswordInput" : "password"
    "HotkeyInput"   : "hotkey"
    "SearchSelect"  : "choice"
    todo            : "list"

*/

// TODO integrate storage control (maybe a FormController watching if anything in form changes)

// TODO use logic for disabled property

/* TODO add visible property (use logic)
    if (visible != null) {
        if (typeof visible === "boolean") {
            el.style.display = visible ? "" : "none";
        } else {
            const logicHandler = new LogicHandler(storage, visible);
            logicHandler.addEventListener("change", (event) => {
                el.style.display = event.value ? "" : "none";
            });
            if (!logicHandler.value) {
                el.style.display = "none";
            }
        }
    }
*/

class FormBuilder { // FormController(?)

    build(options, opts = {}) {
        const formEl = document.createElement("form", {is: "emc-form"});

        const {
            allowsInvalid = false,
            submitButton,
            resetButton
        } = opts;

        if (allowsInvalid) {
            formEl.setAttribute("novalidate", "");
        }

        for (const option of options) {
            formEl.append(this.#createOption(option));
        }

        if (!Helper.isNullOrFalse(submitButton) || !Helper.isNullOrFalse(resetButton)) {
            const buttonRowEl = document.createElement("emc-form-buttonrow");
            if (!Helper.isNullOrFalse(resetButton)) {
                if (typeof resetButton === "object") {
                    buttonRowEl.append(this.#createResetButton(null, resetButton));
                } else if (typeof resetButton === "string") {
                    buttonRowEl.append(this.#createResetButton(null, {
                        value: resetButton
                    }));
                } else if (resetButton === true) {
                    buttonRowEl.append(this.#createResetButton(null, {}));
                }
            }
            if (!Helper.isNullOrFalse(submitButton)) {
                if (typeof submitButton === "object") {
                    buttonRowEl.append(this.#createSubmitButton(null, submitButton));
                } else if (typeof submitButton === "string") {
                    buttonRowEl.append(this.#createSubmitButton(null, {
                        value: submitButton
                    }));
                } else if (submitButton === true) {
                    buttonRowEl.append(this.#createSubmitButton(null, {}));
                }
            }
            formEl.append(buttonRowEl);
        }

        return formEl;
    }

    #createOption(option = {}) {
        const {type, id, ...params} = option;
        switch (type) {
            case "SubmitButton": {
                return this.#createSubmitButton(id, params);
            }
            case "ResetButton": {
                return this.#createResetButton(id, params);
            }
            case "ActionButton": {
                return this.#createActionButton(id, params);
            }
            case "LinkButton": {
                return this.#createLinkButton(id, params);
            }
            case "Fieldset": {
                return this.#createFieldset(id, params);
            }
            case "ButtonRow": {
                return this.#createButtonRow(id, params);
            }
            default: {
                return this.#createField(type, id, params);
            }
        }
    }

    #createField(type, id, params = {}) {
        const el = FormElementRegistry.create(type, params);
        if (id != null) {
            el.id = id;
        }
        return el;
    }

    #createSubmitButton(id, params = {}) {
        const el = document.createElement("emc-button-submit");
        if (id != null) {
            el.id = id;
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.value != null) {
            el.value = params.value;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createResetButton(id, params = {}) {
        const el = document.createElement("emc-button-reset");
        if (id != null) {
            el.id = id;
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.value != null) {
            el.value = params.value;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createActionButton(id, params = {}) {
        const el = document.createElement("emc-button-action");
        if (id != null) {
            el.id = id;
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.value != null) {
            el.value = params.value;
        }
        if (params.icon != null) {
            el.icon = params.icon;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.action != null) {
            el.action = params.action;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createLinkButton(id, params = {}) {
        const el = document.createElement("emc-button-link");
        if (id != null) {
            el.id = id;
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.value != null) {
            el.value = params.value;
        }
        if (params.icon != null) {
            el.icon = params.icon;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.href != null) {
            el.href = params.href;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createFieldset(id, params = {}) {
        const el = document.createElement("emc-form-fieldset");
        if (id != null) {
            el.id = id;
        }
        if (params.label != null) {
            el.label = params.label;
        }
        if (params.desc != null) {
            el.desc = params.desc;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        for (const op of params.children) {
            el.append(this.#createOption(op));
        }
        return el;
    }

    #createButtonRow(id, params = {}) {
        const el = document.createElement("emc-form-buttonrow");
        if (id != null) {
            el.id = id;
        }
        for (const op of params.children) {
            el.append(this.#createOption(op));
        }
        return el;
    }

}

export default new FormBuilder();
