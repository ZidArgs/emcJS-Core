import CustomElement from "../element/CustomElement.js";
import "./SettingsPanel.js";
import TPL from "./SettingsOverlay.js.html" assert {type: "html"};
import STYLE from "./SettingsOverlay.js.css" assert {type: "css"};

export default class SettingsOverlay extends CustomElement {

    #focusTopEl;

    #focusBottomEl;

    #titleTextEl;

    #settingsPanelEl;

    #errorButtonEl;

    #submitEl;

    #cancelEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#titleTextEl = this.shadowRoot.getElementById("title-text");
        this.#settingsPanelEl = this.shadowRoot.getElementById("settings-panel");
        this.#errorButtonEl = this.shadowRoot.getElementById("error-button");
        /* --- */
        this.#submitEl = this.shadowRoot.getElementById("submit");
        this.#cancelEl = this.shadowRoot.getElementById("cancel");
        this.#initSettingsPanelHandlers();
        /* --- */
        this.#focusTopEl = this.shadowRoot.getElementById("focus_catcher_top");
        this.registerTargetEventHandler(this.#focusTopEl, "focus", () => {
            this.focusLast();
        });
        this.#focusBottomEl = this.shadowRoot.getElementById("focus_catcher_bottom");
        this.registerTargetEventHandler(this.#focusBottomEl, "focus", () => {
            this.focusFirst();
        });
    }

    set caption(value) {
        this.setStringAttribute("caption", value);
    }

    get caption() {
        return this.getStringAttribute("caption");
    }

    set autosave(value) {
        this.setBooleanAttribute("autosave", value);
    }

    get autosave() {
        return this.getBooleanAttribute("autosave");
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
            case "autosave": {
                if (oldValue != newValue) {
                    if (newValue) {
                        // TODO activate save on change
                    } else {
                        // TODO deactivate save on change
                    }
                }
            } break;
        }
    }

    loadConfig(config, defaultValues) {
        this.#settingsPanelEl.loadConfig(config, defaultValues);
    }

    setValues(values) {
        this.#settingsPanelEl.setValues(values);
    }

    setValuesFlat(values) {
        this.#settingsPanelEl.setValuesFlat(values);
    }

    getValues() {
        this.#settingsPanelEl.getValues();
    }

    getValuesFlat() {
        this.#settingsPanelEl.getValuesFlat();
    }

    show() {
        document.body.append(this);
        this.initialFocus();
    }

    submit() {
        this.#settingsPanelEl.submit();
    }

    cancel() {
        this.#settingsPanelEl.cancel();
    }

    #initSettingsPanelHandlers() {
        this.registerTargetEventHandler(this.#submitEl, "click", () => {
            this.submit();
        });
        this.registerTargetEventHandler(this.#cancelEl, "click", () => {
            this.cancel();
        });
        this.registerTargetEventHandler(this.#settingsPanelEl, "submit", (event) => {
            this.#errorButtonEl.setErrors();
            this.#onsubmit(event);
        });
        this.registerTargetEventHandler(this.#settingsPanelEl, "cancel", () => {
            this.#errorButtonEl.setErrors();
            this.#oncancel();
        });
        this.registerTargetEventHandler(this.#settingsPanelEl, "error", (event) => {
            const {errors} = event;
            this.#errorButtonEl.setErrors(errors);
        });
        this.registerTargetEventHandler(this.#settingsPanelEl, "validity", (event) => {
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

    #onsubmit(event) {
        this.remove();
        const {
            data, formData, hiddenData, changes, errors
        } = event;
        const ev = new Event("submit");
        ev.data = data;
        ev.formData = formData;
        ev.hiddenData = hiddenData;
        ev.changes = changes;
        ev.errors = errors;
        this.dispatchEvent(ev);
    }

    #oncancel() {
        this.remove();
        this.dispatchEvent(new Event("cancel"));
    }

    initialFocus() {
        this.#settingsPanelEl.initialFocus();
    }

    focusFirst() {
        this.#settingsPanelEl.focusFirst();
    }

    focusLast() {
        this.#submitEl.focus();
    }

}

customElements.define("emc-settings-overlay", SettingsOverlay);
