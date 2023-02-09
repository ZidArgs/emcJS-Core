import FormElementRegistry from "../../data/registry/FormElementRegistry.js";
import {
    isNullOrFalse
} from "../helper/Comparator.js";
import "../../ui/form/FormFieldset.js";
import "../../ui/form/FormButtonRow.js";
import "../../ui/form/button/SubmitButton.js";
import "../../ui/form/button/ResetButton.js";
import "../../ui/form/button/ActionButton.js";
import "../../ui/form/button/LinkButton.js";

class FormBuilder {

    build(formConfig, defaultValues, opts) {
        if (formConfig != null && !(typeof formConfig === "object")) {
            throw new TypeError("first parameter must be an object or an array or null");
        }
        if (defaultValues != null && !(typeof defaultValues === "object") || Array.isArray(defaultValues)) {
            throw new TypeError("second parameter must be an object or null");
        }
        if (opts != null && !(typeof opts === "object") || Array.isArray(opts)) {
            throw new TypeError("third parameter must be an object or null");
        }

        const formEl = document.createElement("form");

        const {
            allowsInvalid = false,
            submitButton,
            resetButton,
            data = {}
        } = opts ?? {};

        if (allowsInvalid) {
            formEl.setAttribute("novalidate", "");
        }

        for (const key in data) {
            const value = data[key];
            const hiddenEl = document.createElement("input");
            hiddenEl.setAttribute("type", "hidden");
            hiddenEl.setAttribute("name", key);
            if (typeof value === "object") {
                hiddenEl.setAttribute("value", JSON.stringify(value ?? ""));
            } else {
                hiddenEl.setAttribute("value", value ?? "");
            }
            formEl.append(hiddenEl);
        }

        if (formConfig != null) {
            if (Array.isArray(formConfig)) {
                for (const option of formConfig) {
                    formEl.append(this.#createOption(option, defaultValues ?? {}));
                }
            } else {
                formEl.append(this.#createOption(formConfig, defaultValues ?? {}));
            }
        }

        if (!isNullOrFalse(submitButton) || !isNullOrFalse(resetButton)) {
            const buttonRowEl = document.createElement("emc-form-buttonrow");
            if (!isNullOrFalse(resetButton)) {
                if (typeof resetButton === "object") {
                    buttonRowEl.append(this.#createResetButton(null, resetButton));
                } else if (typeof resetButton === "string") {
                    buttonRowEl.append(this.#createResetButton(null, {
                        text: resetButton
                    }));
                } else if (resetButton === true) {
                    buttonRowEl.append(this.#createResetButton(null, {}));
                }
            }
            if (!isNullOrFalse(submitButton)) {
                if (typeof submitButton === "object") {
                    buttonRowEl.append(this.#createSubmitButton(null, submitButton));
                } else if (typeof submitButton === "string") {
                    buttonRowEl.append(this.#createSubmitButton(null, {
                        text: submitButton
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
        const {type, id, visible, enabled, ...params} = option;
        switch (type) {
            case "SubmitButton": {
                return this.#createSubmitButton(id, visible, enabled, params);
            }
            case "ResetButton": {
                return this.#createResetButton(id, visible, enabled, params);
            }
            case "ActionButton": {
                return this.#createActionButton(id, visible, enabled, params);
            }
            case "LinkButton": {
                return this.#createLinkButton(id, visible, enabled, params);
            }
            case "Fieldset": {
                return this.#createFieldset(id, visible, enabled, params, defaultValues);
            }
            case "ButtonRow": {
                return this.#createButtonRow(id, visible, enabled, params);
            }
            default: {
                return this.#createField(type, id, visible, enabled, params, defaultValues);
            }
        }
    }

    #createField(type, id, visible, enabled, config = {}, defaultValues = {}) {
        const {value, ...params} = config;
        const el = FormElementRegistry.create(type, params);
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
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

    #createSubmitButton(id, visible, enabled, params = {}) {
        const el = document.createElement("emc-button-submit");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.text != null) {
            el.text = params.text;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createResetButton(id, visible, enabled, params = {}) {
        const el = document.createElement("emc-button-reset");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.text != null) {
            el.text = params.text;
        }
        if (params.tooltip != null) {
            el.tooltip = params.tooltip;
        }
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createActionButton(id, visible, enabled, params = {}) {
        const el = document.createElement("emc-button-action");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.text != null) {
            el.text = params.text;
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

    #createLinkButton(id, visible, enabled, params = {}) {
        const el = document.createElement("emc-button-link");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
        }
        if (params.name != null) {
            el.name = params.name;
        }
        if (params.text != null) {
            el.text = params.text;
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

    #createFieldset(id, visible, enabled, params = {}, defaultValues = {}) {
        const el = document.createElement("emc-form-fieldset");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
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

    #createButtonRow(id, visible, enabled, params = {}) {
        const el = document.createElement("emc-form-buttonrow");
        if (id != null) {
            el.id = id;
        }
        if (visible != null) {
            el.setAttribute("visible", JSON.stringify(visible));
        }
        if (enabled != null) {
            el.setAttribute("enabled", JSON.stringify(enabled));
        }
        for (const op of params.children) {
            el.append(this.#createOption(op));
        }
        return el;
    }

}

export default new FormBuilder();
