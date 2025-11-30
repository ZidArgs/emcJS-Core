import CustomElement from "../element/CustomElement.js";
import FormContext from "../../util/form/FormContext.js";
import FormBuilder from "../../util/form/FormBuilder.js";
import CharacterSearch from "../../util/search/CharacterSearch.js";
import SelectEntry from "../form/element/components/SelectEntry.js";
import TreeNode from "../tree/components/TreeNode.js";
import "../tree/Tree.js";
import "../navigation/button/HamburgerButton.js";
import TPL from "./SettingsPanel.js.html" assert {type: "html"};
import STYLE from "./SettingsPanel.js.css" assert {type: "css"};

export default class SettingsPanel extends CustomElement {

    #focusTopEl;

    #focusBottomEl;

    #titleTextEl;

    #hamburgerEl;

    #searchEl;

    #formSectionNavigationEl;

    #settingsFormEl;

    #formContext = new FormContext();

    #errorButtonEl;

    #submitEl;

    #cancelEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#formContext.allowEnter = true;
        this.#formContext.hideErrors = true;
        /* --- */
        this.#titleTextEl = this.shadowRoot.getElementById("title-text");
        this.#hamburgerEl = this.shadowRoot.getElementById("hamburger-button");
        this.#formSectionNavigationEl = this.shadowRoot.getElementById("form-section-navigation");
        const formContainerEl = this.shadowRoot.getElementById("form-container");
        this.#settingsFormEl = this.shadowRoot.getElementById("settings-form");
        this.#errorButtonEl = this.shadowRoot.getElementById("error-button");
        this.#formContext.registerFormContainer(formContainerEl);
        formContainerEl.setFormSectionNavigationElement(this.#formSectionNavigationEl);
        /* --- */
        const footerFormEl = this.shadowRoot.getElementById("footer-form");
        this.#formContext.registerForm(footerFormEl);
        this.#initErrorButton();
        /* --- */
        this.#submitEl = this.shadowRoot.getElementById("submit");
        this.#cancelEl = this.shadowRoot.getElementById("cancel");
        this.#cancelEl.addEventListener("click", () => this.cancel());
        /* --- */
        this.#hamburgerEl.addEventListener("click", () => {
            if (this.#formSectionNavigationEl.classList.contains("open")) {
                this.#formSectionNavigationEl.classList.remove("open");
                this.#formSectionNavigationEl.classList.remove("cover");
                this.#hamburgerEl.open = false;
            } else {
                this.#formSectionNavigationEl.classList.add("open");
                this.#hamburgerEl.open = true;
                this.#formSectionNavigationEl.focus();
            }
        });
        this.#formSectionNavigationEl.addEventListener("select", () => {
            if (this.#formSectionNavigationEl.classList.contains("open")) {
                this.#formSectionNavigationEl.classList.remove("open");
                this.#formSectionNavigationEl.classList.remove("cover");
                this.#hamburgerEl.open = false;
            }
        });
        /* --- */
        this.#searchEl = this.shadowRoot.getElementById("search");
        this.#searchEl.addEventListener("change", () => {
            const all = this.#settingsFormEl.querySelectorAll(":scope [name]:not(emc-form-section)");
            const sections = [...this.#settingsFormEl.querySelectorAll("emc-form-section")].reverse();
            const searchValue = this.#searchEl.value;
            if (searchValue) {
                const regEx = new CharacterSearch(searchValue);
                for (const el of all) {
                    const value = el.dataset.filtervalue ?? this.getOuterText(el, [SelectEntry]);
                    if (regEx.test(value)) {
                        el.classList.remove("hidden");
                    } else {
                        el.classList.add("hidden");
                    }
                }
                for (const el of sections) {
                    const children = el.querySelectorAll(":scope [name]:not(emc-form-section):not(option)");
                    if (Array.from(children).some((ch) => !ch.classList.contains("hidden"))) {
                        el.classList.remove("hidden");
                        const connectedTreeNode = TreeNode.getByConnectedNode(el)[0];
                        if (connectedTreeNode != null) {
                            connectedTreeNode.style.display = "";
                        }
                        continue;
                    }
                    el.classList.add("hidden");
                    const connectedTreeNode = TreeNode.getByConnectedNode(el)[0];
                    if (connectedTreeNode != null) {
                        connectedTreeNode.style.display = "none";
                    }
                }
            } else {
                for (const el of all) {
                    el.classList.remove("hidden");
                }
                for (const el of sections) {
                    el.classList.remove("hidden");
                    const connectedTreeNode = TreeNode.getByConnectedNode(el)[0];
                    if (connectedTreeNode != null) {
                        connectedTreeNode.style.display = "";
                    }
                }
            }
        }, true);
        /* --- */
        this.#focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        this.#focusTopEl.addEventListener("focus", () => {
            this.focusLast();
        });
        this.#focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        this.#focusBottomEl.addEventListener("focus", () => {
            this.focusFirst();
        });
    }

    set caption(value) {
        this.setStringAttribute("caption", value);
    }

    get caption() {
        return this.getStringAttribute("caption");
    }

    set type(value) {
        this.setStringAttribute("type", value);
    }

    get type() {
        return this.getStringAttribute("type");
    }

    static get observedAttributes() {
        return ["caption", "type"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "caption": {
                if (oldValue != newValue) {
                    this.#titleTextEl.i18nValue = newValue;
                }
            } break;
            case "type": {
                if (oldValue != newValue) {
                    if (newValue === "modal") {
                        this.#focusTopEl.setAttribute("tabindex", "0");
                        this.#focusBottomEl.setAttribute("tabindex", "0");
                    } else {
                        this.#focusTopEl.removeAttribute("tabindex");
                        this.#focusBottomEl.removeAttribute("tabindex");
                    }
                }
            } break;
        }
    }

    loadConfig(config, defaultValues) {
        FormBuilder.replaceForm(this.#settingsFormEl, config, defaultValues);
    }

    setValues(values) {
        this.#formContext.setData(values);
    }

    setValuesFlat(values) {
        this.#formContext.setDataFlat(values);
    }

    getValues() {
        this.#formContext.getData();
    }

    getValuesFlat() {
        this.#formContext.getDataFlat();
    }

    show() {
        if (this.type === "modal") {
            document.body.append(this);
            this.initialFocus();
        }
    }

    remove() {
        if (this.type === "modal") {
            super.remove();
        }
    }

    submit() {
        this.remove();
        const event = new Event("submit");
        event.data = this.#formContext.getDataFlat();
        event.formData = this.#formContext.getFormFieldsData();
        event.hiddenData = this.#formContext.getFormHiddenData();
        event.changes = this.#formContext.getChanges();
        event.errors = this.#formContext.getErrors();
        this.dispatchEvent(event);
    }

    cancel() {
        this.#formContext.reset();
        this.remove();
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

    initialFocus() {
        const inputEl = this.#settingsFormEl.querySelector("[name]");
        if (inputEl != null) {
            inputEl.focus();
        } else {
            this.#searchEl.focus();
        }
    }

    focusFirst() {
        const panelWidth = this.clientWidth;
        if (panelWidth < 800) {
            this.#hamburgerEl.focus();
        } else {
            this.#searchEl.focus();
        }
    }

    focusLast() {
        this.#submitEl.focus();
    }

}

customElements.define("emc-settings-panel", SettingsPanel);
