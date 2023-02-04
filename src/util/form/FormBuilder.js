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

class FormBuilder {

    build(formConfig, defaultValues = {}, opts = {}) {
        const formEl = document.createElement("form", {is: "emc-form"});

        const {
            allowsInvalid = false,
            submitButton,
            resetButton
        } = opts;

        if (allowsInvalid) {
            formEl.setAttribute("novalidate", "");
        }

        if (Array.isArray(formConfig)) {
            for (const option of formConfig) {
                formEl.append(this.#createOption(option, defaultValues ?? {}));
            }
        } else {
            formEl.append(this.#createOption(formConfig, defaultValues ?? {}));
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

    #createOption(option = {}, defaultValues = {}) {
        const {type, id, visible, ...params} = option;
        switch (type) {
            case "SubmitButton": {
                return this.#createSubmitButton(id, visible, params);
            }
            case "ResetButton": {
                return this.#createResetButton(id, visible, params);
            }
            case "ActionButton": {
                return this.#createActionButton(id, visible, params);
            }
            case "LinkButton": {
                return this.#createLinkButton(id, visible, params);
            }
            case "Fieldset": {
                return this.#createFieldset(id, visible, params, defaultValues);
            }
            case "ButtonRow": {
                return this.#createButtonRow(id, visible, params);
            }
            default: {
                return this.#createField(type, id, visible, params, defaultValues);
            }
        }
    }

    #createField(type, id, visible, config = {}, defaultValues = {}) {
        const {value, ...params} = config;
        const el = FormElementRegistry.create(type, params);
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (params.name != null && defaultValues[params.name] != null) {
            const value = defaultValues[params.name];
            if (typeof value === "object") {
                el.setAttribute("value", JSON.stringify(value));
            } else {
                el.setAttribute("value", value);
            }
        } else if (value != null) {
            if (typeof value === "object") {
                el.setAttribute("value", JSON.stringify(value));
            } else {
                el.setAttribute("value", value);
            }
        } else {
            el.removeAttribute("value");
        }
        return el;
    }

    #createSubmitButton(id, visible, params = {}) {
        const el = document.createElement("emc-button-submit");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
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

    #createResetButton(id, visible, params = {}) {
        const el = document.createElement("emc-button-reset");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
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

    #createActionButton(id, visible, params = {}) {
        const el = document.createElement("emc-button-action");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
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

    #createLinkButton(id, visible, params = {}) {
        const el = document.createElement("emc-button-link");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
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

    #createFieldset(id, visible, params = {}, defaultValues = {}) {
        const el = document.createElement("emc-form-fieldset");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
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
            el.append(this.#createOption(op, defaultValues));
        }
        return el;
    }

    #createButtonRow(id, visible, params = {}) {
        const el = document.createElement("emc-form-buttonrow");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        for (const op of params.children) {
            el.append(this.#createOption(op));
        }
        return el;
    }

}

export default new FormBuilder();
