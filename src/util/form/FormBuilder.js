import FormElementRegistry from "../../data/registry/form/FormElementRegistry.js";
import {
    isNullOrFalse
} from "../helper/CheckType.js";
import "../../ui/form/FormContainer.js";
import "../../ui/form/FormFieldset.js";
import "../../ui/form/FormRow.js";
import "../../ui/form/button/SubmitButton.js";
import "../../ui/form/button/ResetButton.js";
import "../../ui/form/button/ActionButton.js";
import "../../ui/form/button/LinkButton.js";
import "../../ui/form/field/DefaultFormFieldsLoader.js";

class FormBuilder {

    build(config, label = null) {
        if (config != null && !(typeof config === "object")) {
            throw new TypeError("config must be an Object or an array or null");
        }

        const formContainerEl = document.createElement("emc-form-container");

        if (config != null) {
            const {
                forms,
                hasHeader = false,
                hasFooter = false,
                defaultValues = {}
            } = config;

            formContainerEl.hasHeader = hasHeader;
            formContainerEl.hasFooter = hasFooter;

            if (forms != null) {
                if (Array.isArray(forms)) {
                    for (const {elements, config: formConfig, values} of forms) {
                        formContainerEl.append(this.buildForm(elements, {...values, ...defaultValues}, formConfig, label));
                    }
                } else {
                    const {elements, config: formConfig, values} = forms;
                    formContainerEl.append(this.buildForm(elements, {...values, ...defaultValues}, formConfig, label));
                }
            } else {
                const {elements, config: formConfig, values} = config;
                formContainerEl.append(this.buildForm(elements, values, formConfig, label));
            }
        }

        return formContainerEl;
    }

    buildForm(content, defaultValues, params, label = null) {
        if (content != null && typeof content !== "object") {
            throw new TypeError("content must be an HTMLElement, Object, Array or null");
        }
        if (defaultValues != null && typeof defaultValues !== "object" || Array.isArray(defaultValues)) {
            throw new TypeError("defaultValues must be an Object or null");
        }
        if (params != null && !(typeof params === "object") || Array.isArray(params)) {
            throw new TypeError("params must be an Object or null");
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

        this.replaceForm(formEl, content, defaultValues, formParams, label);

        return formEl;
    }

    replaceForm(formEl, content, defaultValues, params, label = null) {
        if (!(formEl instanceof HTMLFormElement)) {
            throw new TypeError("formEl must be of type HTMLFormElement");
        }
        if (content != null && typeof content !== "object") {
            throw new TypeError("content must be an HTMLElement, Object, Array or null");
        }
        if (defaultValues != null && typeof defaultValues !== "object" || Array.isArray(defaultValues)) {
            throw new TypeError("defaultValues must be an Object or null");
        }
        if (params != null && !(typeof params === "object") || Array.isArray(params)) {
            throw new TypeError("params must be an Object or null");
        }

        formEl.innerHTML = "";

        const {
            submitButton,
            resetButton,
            values = {}
        } = params ?? {};

        this.#applyHiddenValues(formEl, values);
        this.#fillFormElements(formEl, content, defaultValues, label);

        if (!isNullOrFalse(submitButton) || !isNullOrFalse(resetButton)) {
            const buttonRowEl = document.createElement("emc-form-row");
            buttonRowEl.align = "end";
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

    #applyHiddenValues(containerEl, values) {
        if (!(containerEl instanceof HTMLElement)) {
            throw new TypeError("containerEl must be of type HTMLElement");
        }
        if (typeof values !== "object" || Array.isArray(values)) {
            throw new TypeError("values must be an Object");
        }
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
            containerEl.append(hiddenEl);
        }
    }

    #fillFormElements(containerEl, content, defaultValues, label = null) {
        if (!(containerEl instanceof HTMLElement)) {
            throw new TypeError("containerEl must be of type HTMLElement");
        }
        if (content != null && typeof content !== "object") {
            throw new TypeError("content must be an HTMLElement, Object, Array or null");
        }
        if (defaultValues != null && typeof defaultValues !== "object" || Array.isArray(defaultValues)) {
            throw new TypeError("defaultValues must be an Object or null");
        }
        if (content != null) {
            if (Array.isArray(content)) {
                for (const config of content) {
                    if (config instanceof HTMLElement) {
                        containerEl.append(config);
                    } else {
                        containerEl.append(this.#createFormElement(config, defaultValues ?? {}, label));
                    }
                }
            } else if (content instanceof HTMLElement) {
                containerEl.append(content);
            } else {
                containerEl.append(this.#createFormElement(content, defaultValues ?? {}, label));
            }
        }
    }

    #createFormElement(config = {}, defaultValues = {}, label = null) {
        const {type, id, visible, enabled, data, ...params} = config;
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
            case "Row": {
                return this.#createRow(id, visible, enabled, params, data, defaultValues);
            }
            default: {
                return this.#createField(type, id, visible, enabled, params, data, defaultValues, label);
            }
        }
    }

    #createField(type, id, visible, enabled, config = {}, data = {}, defaultValues = {}, label = null) {
        const {value, ...params} = config;
        const el = FormElementRegistry.create(type, params, label);
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

    #createFieldset(id, visible, enabled, params = {}, data = {}, defaultValues = {}, label = null) {
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
        this.#fillFormElements(el, params.children, defaultValues, label);
        return el;
    }

    #createRow(id, visible, enabled, params = {}, data = {}, defaultValues = {}, label = null) {
        const el = document.createElement("emc-form-row");
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
        if (params.align != null) {
            el.align = params.align;
        }
        this.#fillFormElements(el, params.children, defaultValues, label);
        return el;
    }

}

export default new FormBuilder();
