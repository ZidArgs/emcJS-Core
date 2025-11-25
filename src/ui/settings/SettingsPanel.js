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

    #hamburgerEl;

    #searchEl;

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
        this.#hamburgerEl = this.shadowRoot.getElementById("hamburger-button");
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
        /* --- */
        this.#hamburgerEl.addEventListener("click", () => {
            if (formSectionNavigationEl.classList.contains("open")) {
                formSectionNavigationEl.classList.remove("open");
                formSectionNavigationEl.classList.remove("cover");
                this.#hamburgerEl.open = false;
            } else {
                formSectionNavigationEl.classList.add("open");
                this.#hamburgerEl.open = true;
            }
        });
        formSectionNavigationEl.addEventListener("select", () => {
            if (formSectionNavigationEl.classList.contains("open")) {
                formSectionNavigationEl.classList.remove("open");
                formSectionNavigationEl.classList.remove("cover");
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
    }

    loadConfig(config, defaultValues) {
        FormBuilder.replaceForm(this.#settingsFormEl, config, defaultValues);
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

}

customElements.define("emc-settings-panel", SettingsPanel);
