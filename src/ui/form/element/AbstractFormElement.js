import CustomFormElement from "../../element/CustomFormElement.js";
import {deepClone} from "../../../util/helper/DeepClone.js";
import {debounce} from "../../../util/Debouncer.js";
import {isEqual} from "../../../util/helper/Comparator.js";
import {delimitInteger} from "../../../util/helper/number/Integer.js";
import "../button/Button.js";
import TPL from "./AbstractFormElement.js.html" assert {type: "html"};
import STYLE from "./AbstractFormElement.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./AbstractFormElement.js.json" assert {type: "json"};

// https://web.dev/more-capable-form-controls/#form-associated-custom-elements

function isValueSet(value) {
    if (value == null) {
        return false;
    }
    if (typeof value === "string") {
        return value !== "";
    }
    if (typeof value === "number") {
        return !isNaN(value);
    }
    if (typeof value === "object") {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return Object.keys(value).length > 0;
    }
    return true;
}

export default class AbstractFormElement extends CustomFormElement {

    static #changeDebounceTime = 300;

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    static get changeDebounceTime() {
        return this.#changeDebounceTime;
    }

    static set changeDebounceTime(value) {
        this.#changeDebounceTime = delimitInteger(value, 0, 1000);
    }

    #value;

    #tooltipEl;

    #labelEl;

    #labelTextEl;

    #resetEl;

    #descriptionEl;

    #errorEl;

    #validators = new Set();

    #errorList = new Set();

    #customValidity = "";

    constructor() {
        if (new.target === AbstractFormElement) {
            throw new Error("can not construct abstract class");
        }
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
        this.#labelEl = this.shadowRoot.getElementById("label");
        this.#labelTextEl = this.shadowRoot.getElementById("label-text");
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#descriptionEl = this.shadowRoot.getElementById("description");
        this.#errorEl = this.shadowRoot.getElementById("error");
        this.#resetEl.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.formResetCallback();
        });
        this.#resetEl.addEventListener("keydown", (event) => {
            if (event.keyCode === 13) {
                event.stopPropagation();
                event.preventDefault();
                this.formResetCallback();
            }
        });
        this.#errorEl.addEventListener("click", () => {
            this.focus();
        });
        /* --- */
        this.addEventListener("validity", (event) => {
            this.#errorEl.i18nContent = event.message ?? "";
        });
        this.addEventListener("invalid", (event) => {
            event.preventDefault();
        });
        /* --- */
        const fieldContainerEl = this.shadowRoot.getElementById("field-container");
        fieldContainerEl.addEventListener("input", (event) => {
            event.stopPropagation();
        });
        fieldContainerEl.addEventListener("change", (event) => {
            event.stopPropagation();
        });
        /* --- */
        this.#labelEl.addEventListener("click", () => {
            this.focus();
        });
    }

    connectedCallback() {
        const isDefault = this.isDefault;
        const value = this.value;
        if (!isDefault) {
            this.renderValue(value);
        }
        this.onDisplayValueChange(value);
        this.refreshFormValue();
        this.revalidate();
        this.#setResetActive(!isDefault);
    }

    formDisabledCallback(disabled) {
        this.#resetEl.disabled = disabled;
    }

    formResetCallback() {
        this.#value = undefined;
        const value = this.value;
        this.renderValue(value);
        this.onDisplayValueChange(value);
        this.refreshFormValue();
        this.revalidate();
        this.#setResetActive(false);
        /* --- */
        const event = new Event("default", {
            bubbles: true,
            cancelable: true
        });
        event.value = this.value;
        event.name = this.name;
        event.fieldId = this.id;
        this.dispatchEvent(event);
    }

    formStateRestoreCallback(state/* , mode */) {
        this.value = state;
    }

    getSubmitValue() {
        return this.value;
    }

    get isInitial() {
        return this.#value === undefined;
    }

    get isEmpty() {
        if (this.#value == null) {
            return true;
        }
        if (typeof this.#value === "string" && this.#value === "") {
            return true;
        }
        if (Array.isArray(this.#value) && this.#value.length === 0) {
            return true;
        }
        return false;
    }

    get isDefault() {
        if (this.value == null) {
            return true;
        }
        return isEqual(this.value, this.defaultValue);
    }

    set value(value) {
        this.#onUpdateValue(value);
    }

    get value() {
        if (this.#value === undefined) {
            return super.value;
        }
        return this.#value;
    }

    get rawValue() {
        return this.#value;
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set tooltip(value) {
        this.setAttribute("tooltip", value);
    }

    get tooltip() {
        return this.getAttribute("tooltip");
    }

    set description(value) {
        this.setAttribute("description", value);
    }

    get description() {
        return this.getAttribute("description");
    }

    set required(value) {
        this.setBooleanAttribute("required", value);
    }

    get required() {
        return this.getBooleanAttribute("required");
    }

    set resettable(value) {
        this.setBooleanAttribute("resettable", value);
    }

    get resettable() {
        return this.getBooleanAttribute("resettable");
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set disabled(value) {
        this.setBooleanAttribute("disabled", value);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set hideErrors(value) {
        this.setBooleanAttribute("hideerrors", value);
    }

    get hideErrors() {
        return this.getBooleanAttribute("hideerrors");
    }

    set noHover(value) {
        this.setBooleanAttribute("nohover", value);
    }

    get noHover() {
        return this.getBooleanAttribute("nohover");
    }

    set noPad(value) {
        this.setBooleanAttribute("nopad", value);
    }

    get noPad() {
        return this.getBooleanAttribute("nopad");
    }

    set noValidate(value) {
        this.setBooleanAttribute("novalidate", value);
    }

    get noValidate() {
        return this.getBooleanAttribute("novalidate");
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "required", "label", "tooltip", "description", "novalidate"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    const defaultValue = this.defaultValue;
                    this.applyValueAttribute(defaultValue);
                    if (this.isInitial) {
                        this.onDisplayValueChange(defaultValue);
                        this.refreshFormValue();
                        this.revalidate();
                        this.#setResetActive(false);
                    } else {
                        this.#setResetActive(!this.isDefault);
                    }
                }
            } break;
            case "required": {
                if (oldValue != newValue) {
                    this.revalidate();
                }
            } break;
            case "label": {
                if (oldValue != newValue) {
                    this.#labelTextEl.i18nValue = newValue;
                }
            } break;
            case "tooltip": {
                if (oldValue != newValue) {
                    this.#tooltipEl.i18nTooltip = newValue;
                }
            } break;
            case "description": {
                if (oldValue != newValue) {
                    this.#descriptionEl.i18nContent = newValue;
                }
            } break;
            case "novalidate": {
                if (oldValue != newValue) {
                    this.revalidate();
                }
            } break;
        }
    }

    getOuterText(node, excludedNodeClasses = []) {
        return super.getText(node, [HTMLOptionElement, ...excludedNodeClasses]);
    }

    #onUpdateValue(value) {
        if (!isEqual(this.value, value)) {
            this.#value = value;
            const newValue = this.value;
            this.renderValue(newValue);
            this.onDisplayValueChange(newValue);
            this.refreshFormValue();
            this.revalidate();
            this.#setResetActive(!this.isDefault);
            this.dispatchEvent(new Event("input", {
                bubbles: true,
                cancelable: true
            }));
            this.#notifyChange();
        }
    }

    #notifyChange = debounce((newValue) => {
        if (!this.#errorList.size) {
            const event = new Event("value", {
                bubbles: true,
                cancelable: true
            });
            event.value = newValue;
            event.name = this.name;
            event.fieldId = this.id;
            this.dispatchEvent(event);
        }
        this.dispatchEvent(new Event("change", {
            bubbles: true,
            cancelable: true
        }));
    }, AbstractFormElement.changeDebounceTime);

    async revalidate() {
        if (!this.noValidate) {
            const value = this.value;
            this.#errorList.clear();
            const internalMessage = this.checkValid();
            if (typeof internalMessage === "string" && internalMessage !== "") {
                this.#errorList.add(internalMessage);
            }
            const validations = [];
            for (const validator of this.#validators) {
                validations.push(this.#doValidation(validator, value));
            }
            await Promise.all(validations);
            this.#showErrors();
            return [...this.#errorList];
        }
        const message = this.validationMessage;
        return message.length > 0 ? [message] : [];
    }

    checkValid() {
        const value = this.value;
        if (this.required && !isValueSet(value)) {
            return "This field is required";
        }
        return "";
    }

    setCustomValidity(message) {
        if (message == null) {
            message = "";
        }
        if (typeof message === "string") {
            this.#customValidity = message.trim();
            this.#showErrors();
        }
    }

    #showErrors = debounce(() => {
        if (!this.noValidate) {
            const message = [this.#customValidity, ...this.#errorList].join("\n").trim();
            super.setCustomValidity(message);
        } else {
            super.setCustomValidity(this.#customValidity);
        }
    });

    get errors() {
        return [...this.#errorList];
    }

    addValidator(validator) {
        if (typeof validator === "function" && !this.#validators.has(validator)) {
            this.#validators.add(validator);
            this.revalidate();
        }
    }

    removeValidator(validator) {
        if (typeof validator === "function" && this.#validators.has(validator)) {
            this.#validators.delete(validator);
            this.revalidate();
        }
    }

    async #doValidation(validator, value) {
        const message = await validator(value);
        if (typeof message === "string" && message !== "") {
            this.#errorList.add(message);
        }
    }

    static scalarToValue(value) {
        value.toString();
    }

    static valueToScalar(value) {
        return value.toString();
    }

    formContextAssociatedCallback(/* formContext */) {
        // ignore
    }

    applyValueAttribute(value) {
        if (this.isInitial) {
            this.renderValue(value);
        }
    }

    renderValue(/* value */) {
        // ignore
    }

    onDisplayValueChange(/* value */) {
        // ignore
    }

    #setResetActive(value) {
        if (!value) {
            this.#resetEl.classList.add("inactive");
            this.#resetEl.setAttribute("tabindex", "-1");
            this.#resetEl.blur();
        } else {
            this.#resetEl.classList.remove("inactive");
            this.#resetEl.removeAttribute("tabindex");
        }
    }

    focus(options) {
        super.focus(options);
        this.scrollIntoView({
            block: "center",
            inline: "center"
        });
    }

}
