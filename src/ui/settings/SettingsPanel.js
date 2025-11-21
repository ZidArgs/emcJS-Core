import CustomElement from "../element/CustomElement.js";
import FormContext from "../../util/form/FormContext.js";
import FormBuilder from "../../util/form/FormBuilder.js";
import "../tree/Tree.js";
import TPL from "./SettingsPanel.js.html" assert {type: "html"};
import STYLE from "./SettingsPanel.js.css" assert {type: "css"};

export default class SettingsPanel extends CustomElement {

    #settingsFormEl;

    #formContext = new FormContext();

    #errorButtonEl;

    #cancelEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formContext.allowEnter = true;
        this.#formContext.hideErrors = true;
        /* --- */
        const formSectionNavigationEl = this.shadowRoot.getElementById("form-section-navigation");
        const formContainerEl = this.shadowRoot.getElementById("form-container");
        this.#settingsFormEl = this.shadowRoot.getElementById("settings-form");
        this.#errorButtonEl = this.shadowRoot.getElementById("error-button");
        this.#formContext.registerFormContainer(formContainerEl);
        formContainerEl.setFormSectionNavigationElement(formSectionNavigationEl);
        /* --- */
        const footerFormEl = this.shadowRoot.getElementById("footer-form");
        this.#formContext.registerForm(footerFormEl);
        this.#initErrorButton();
        /* --- */
        this.#cancelEl = this.shadowRoot.getElementById("cancel");
        this.#cancelEl.addEventListener("click", () => this.cancel());
    }

    loadConfig(config, defaultValues) {
        const formConfig = this.#translateSettings(config);
        FormBuilder.replaceForm(this.#settingsFormEl, formConfig, defaultValues);
    }

    setValues(values) {
        this.#formContext.setData(values);
    }

    getValues() {
        this.#formContext.getData();
    }

    submit() {
        const event = new Event("submit");
        event.data = this.#formContext.getData();
        event.changes = this.#formContext.getChanges();
        this.dispatchEvent(event);
    }

    cancel() {
        this.#formContext.reset();
        this.dispatchEvent(new Event("cancel"));
    }

    #initErrorButton() {
        this.#formContext.addEventListener("submit", () => {
            this.#errorButtonEl.setErrors();
            this.submit();
        });

        this.#formContext.addEventListener("error", (event) => {
            const {errors} = event;
            this.#errorButtonEl.setErrors(errors);
        });

        this.#formContext.addEventListener("validity", (event) => {
            const {valid} = event;
            if (valid) {
                this.#errorButtonEl.removeError(event.element);
            } else {
                this.#errorButtonEl.addError({
                    name: event.name,
                    label: event.element.label,
                    element: event.element,
                    errors: [event.message]
                });
            }
        });
    }

    #translateSettings(config) {
        const sectionMap = new Map();
        const translatedConfig = [];

        for (const [key, value] of Object.entries(config)) {
            const path = key.split(".");
            /* const inputName =  */path.pop();
            const sectionName = path.join(".");
            const sectionConfig = this.#getOrCreateSection(translatedConfig, sectionMap, sectionName);
            sectionConfig.children.push({
                label: key,
                name: key,
                ...value
            });
        }

        return translatedConfig;
    }

    #getOrCreateSection(translatedConfig, sectionMap, sectionName) {
        if (sectionMap.has(sectionName)) {
            return sectionMap.get(sectionName);
        }
        const newSection = {
            type: "Section",
            label: sectionName,
            children: []
        };
        const path = sectionName.split(".");
        if (path.length > 1) {
            /* const currentName =  */path.pop();
            const parentName = path.join(".");
            const parentSection = this.#getOrCreateSection(translatedConfig, sectionMap, parentName);

            parentSection.children.push(newSection);
            sectionMap.set(sectionName, newSection);
            return newSection;
        }
        sectionMap.set(sectionName, newSection);
        translatedConfig.push(newSection);
        return newSection;
    }

}

customElements.define("emc-settings-panel", SettingsPanel);
