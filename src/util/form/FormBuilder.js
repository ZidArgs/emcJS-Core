import FormElementRegistry from "../../data/registry/FormElementRegistry.js";
import {
    isNullOrFalse
} from "../helper/Comparator.js";
import "../../ui/form/FormContainer.js";
import "../../ui/form/FormFieldset.js";
import "../../ui/form/FormButtonRow.js";
import "../../ui/form/button/SubmitButton.js";
import "../../ui/form/button/ResetButton.js";
import "../../ui/form/button/ActionButton.js";
import "../../ui/form/button/LinkButton.js";

class FormBuilder {

    build(config) {
        if (config != null && !(typeof config === "object")) {
            throw new TypeError("config must be an object or an array or null");
        }

        const formContainerEl = document.createElement("emc-form-container");

        if (config != null) {
            const {
                forms,
                hasHeader = false,
                hasFooter = false,
                defaultValues = {}
            } = config;

            if (hasHeader) {
                formContainerEl.classList.add("has-header");
            }
            if (hasFooter) {
                formContainerEl.classList.add("has-footer");
            }

            if (forms != null) {
                if (Array.isArray(forms)) {
                    for (const {elements, config: formConfig, values} of forms) {
                        formContainerEl.append(this.buildForm(elements, {...values, ...defaultValues}, formConfig));
                    }
                } else {
                    const {elements, config: formConfig, values} = forms;
                    formContainerEl.append(this.buildForm(elements, {...values, ...defaultValues}, formConfig));
                }
            } else {
                const {elements, config: formConfig, values} = config;
                formContainerEl.append(this.buildForm(elements, values, formConfig));
            }
        }

        return formContainerEl;
    }

    buildForm(elements, defaultValues, params) {
        if (elements != null && !(typeof elements === "object")) {
            throw new TypeError("elements must be an object or an array or null");
        }
        if (defaultValues != null && !(typeof defaultValues === "object") || Array.isArray(defaultValues)) {
            throw new TypeError("values must be an object or null");
        }
        if (params != null && !(typeof params === "object") || Array.isArray(params)) {
            throw new TypeError("params must be an object or null");
        }

        const formEl = document.createElement("form");

        const {
            allowsInvalid = false,
            data = {},
            ...formParams
        } = params ?? {};

        if (allowsInvalid) {
            formEl.setAttribute("novalidate", "");
        }

        for (const key in data) {
            formEl.dataset[key] = data[key];
        }

        this.replaceForm(formEl, elements, defaultValues, formParams);

        return formEl;
    }

    replaceForm(formEl, elements, defaultValues, params) {
        if (!(formEl instanceof HTMLFormElement)) {
            throw new TypeError("formEl must be of type HTMLFormElement");
        }
        if (elements != null && !(typeof elements === "object")) {
            throw new TypeError("elements must be an object or an array or null");
        }
        if (defaultValues != null && !(typeof defaultValues === "object") || Array.isArray(defaultValues)) {
            throw new TypeError("values must be an object or null");
        }
        if (params != null && !(typeof params === "object") || Array.isArray(params)) {
            throw new TypeError("params must be an object or null");
        }

        formEl.innerHTML = "";

        const {
            submitButton,
            resetButton,
            values = {}
        } = params ?? {};

        for (const key in values) {
            const value = values[key];
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

        if (elements != null) {
            if (Array.isArray(elements)) {
                for (const option of elements) {
                    if (option instanceof HTMLElement) {
                        formEl.append(option);
                    } else {
                        formEl.append(this.#createOption(option, defaultValues ?? {}));
                    }
                }
            } else if (elements instanceof HTMLElement) {
                formEl.append(elements);
            } else {
                formEl.append(this.#createOption(elements, defaultValues ?? {}));
            }
        }

        if (!isNullOrFalse(submitButton) || !isNullOrFalse(resetButton)) {
            const buttonRowEl = document.createElement("emc-form-buttonrow");
            if (!isNullOrFalse(resetButton)) {
                if (typeof resetButton === "object") {
                    buttonRowEl.append(this.#createResetButton(null, true, true, resetButton));
                } else if (typeof resetButton === "string") {
                    buttonRowEl.append(this.#createResetButton(null, true, true, {
                        text: resetButton
                    }));
                } else if (resetButton === true) {
                    buttonRowEl.append(this.#createResetButton(null, true, true, {}));
                }
            }
            if (!isNullOrFalse(submitButton)) {
                if (typeof submitButton === "object") {
                    buttonRowEl.append(this.#createSubmitButton(null, true, true, submitButton));
                } else if (typeof submitButton === "string") {
                    buttonRowEl.append(this.#createSubmitButton(null, true, true, {
                        text: submitButton
                    }));
                } else if (submitButton === true) {
                    buttonRowEl.append(this.#createSubmitButton(null, true, true, {}));
                }
            }
            formEl.append(buttonRowEl);
        }
    }

    #createOption(option = {}, defaultValues = {}) {
        const {type, id, visible, enabled, data, ...params} = option;
        switch (type) {
            case "SubmitButton": {
                return this.#createSubmitButton(id, visible, enabled, params, data);
            }
            case "ResetButton": {
                return this.#createResetButton(id, visible, enabled, params, data);
            }
            case "Button": {
                return this.#createButton(id, visible, enabled, params, data);
            }
            case "ActionButton": {
                return this.#createActionButton(id, visible, enabled, params, data);
            }
            case "LinkButton": {
                return this.#createLinkButton(id, visible, enabled, params, data);
            }
            case "Fieldset": {
                return this.#createFieldset(id, visible, enabled, params, data, defaultValues);
            }
            case "ButtonRow": {
                return this.#createButtonRow(id, visible, enabled, params, data);
            }
            default: {
                return this.#createField(type, id, visible, enabled, params, data, defaultValues);
            }
        }
    }

    #createField(type, id, visible, enabled, config = {}, data = {}, defaultValues = {}) {
        const {value, ...params} = config;
        const el = FormElementRegistry.create(type, params);
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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

    #createSubmitButton(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-button-submit");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createResetButton(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-button-reset");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createButton(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-button");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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
        if (params.disabled != null) {
            el.disabled = params.disabled;
        }
        return el;
    }

    #createActionButton(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-button-action");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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

    #createLinkButton(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-button-link");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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

    #createFieldset(id, visible, enabled, params = {}, data = {}, defaultValues = {}) {
        const el = document.createElement("emc-form-fieldset");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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

    #createButtonRow(id, visible, enabled, params = {}, data = {}) {
        const el = document.createElement("emc-form-buttonrow");
        if (id != null) {
            el.id = id;
        }
        for (const key in data) {
            el.dataset[key] = data[key];
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
