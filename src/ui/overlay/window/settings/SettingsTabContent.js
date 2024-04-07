import CustomElement from "../../../element/CustomElement.js";
import LogicHandler from "../../../../util/logic/processor/LogicHandler.js";
import I18nLabel from "../../../i18n/I18nLabel.js";
import "../../../i18n/I18nTextbox.js";
import "../../../input/InputWrapper.js";
import "../../../input/KeyInput.js";
import "../../../input/ListSelect.js";
import "../../../input/SearchSelect.js";
import "../../../input/Option.js";
import TPL from "./SettingsTabContent.js.html" assert {type: "html"};
import STYLE from "./SettingsTabContent.js.css" assert {type: "css"};

function generateField(label, desc, inputEl, storage, visible, resetEl) {
    const optionEl = document.createElement("div");
    optionEl.className = "settings-option";

    { // container
        const containerEl = document.createElement("div");
        containerEl.className = "option-container";

        { // label
            const labelEl = document.createElement("label");
            labelEl.className = "option-text";
            labelEl.setAttribute("for", inputEl.id);
            labelEl.append(I18nLabel.getLabel(label));
            containerEl.append(labelEl);
        }

        { // input
            const fieldEl = document.createElement("div");
            fieldEl.className = "option-input";

            { // input wrapper
                const wrapperEl = document.createElement("emc-input-wrapper");
                wrapperEl.append(inputEl);
                fieldEl.append(wrapperEl);
            }

            if (resetEl) {
                fieldEl.append(resetEl);
            }

            containerEl.append(fieldEl);
        }

        optionEl.append(containerEl);
    }

    if (desc) { // description
        const descEl = document.createElement("emc-i18n-textbox");
        descEl.className = "option-desc";
        descEl.i18nContent = desc;
        optionEl.append(descEl);
    }

    // visibility
    if (visible != null) {
        const logicHandler = new LogicHandler(storage, visible);
        logicHandler.addEventListener("change", (event) => {
            optionEl.style.display = event.value ? "" : "none";
        });
        if (!logicHandler.value) {
            optionEl.style.display = "none";
        }
    }
    // ---
    return optionEl;
}

function createResetButton(storage, ref) {
    const resetEl = document.createElement("button");
    resetEl.innerHTML = "↺";
    resetEl.setAttribute("title", "reset");
    if (typeof storage == "function") {
        resetEl.addEventListener("click", storage);
    } else {
        resetEl.addEventListener("click", () => {
            storage.resetValue(ref);
        });
    }
    const wrapperEl = document.createElement("emc-input-wrapper");
    wrapperEl.className = "option-reset";
    wrapperEl.append(resetEl);
    return wrapperEl;
}

function generateEmcOption(value, label) {
    const optionEl = document.createElement("emc-option");
    optionEl.value = value;
    if (label instanceof HTMLElement) {
        optionEl.append(label);
    } else {
        const el = document.createElement("emc-i18n-label");
        el.i18nValue = label;
        optionEl.append(el);
    }
    return optionEl;
}

function convertValueList(values = {}) {
    const opt = {};
    if (typeof values == "object") {
        if (Array.isArray(values)) {
            for (const key of values) {
                opt[key] = key;
            }
        } else {
            for (const key in values) {
                if (values[key] != null) {
                    opt[key] = values[key];
                } else {
                    opt[key] = key;
                }
            }
        }
    }
    return opt;
}

export default class SettingsTabContent extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    addStringInput(storage, ref, label, desc, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "text");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addNumberInput(storage, ref, label, desc, visible, resettable, min, max) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "number");
        inputEl.value = storage.get(ref);
        if (!isNaN(min)) {
            inputEl.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            inputEl.setAttribute("max", max);
        }
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = parseFloat(event.data[ref]) || 0;
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addRangeInput(storage, ref, label, desc, visible, resettable, min, max) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "range");
        inputEl.value = storage.get(ref);
        if (!isNaN(min)) {
            inputEl.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            inputEl.setAttribute("max", max);
        }
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = parseFloat(event.data[ref]) || 0;
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addCheckInput(storage, ref, label, desc, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "checkbox");
        inputEl.checked = !!storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.checked = !!event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.checked = !!event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.checked = !!event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, !!inputEl.checked);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addColorInput(storage, ref, label, desc, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "color");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addKeyInput(storage, ref, label, desc, visible, resettable) {
        const inputEl = document.createElement("emc-keyinput");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "input");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addChoiceInput(storage, ref, label, desc, visible, resettable, values = {}) {
        const convertedValues = convertValueList(values);
        const inputEl = document.createElement("emc-searchselect");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "input");
        for (const value in convertedValues) {
            inputEl.append(generateEmcOption(value, convertedValues[value]));
        }
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addListSelectInput(storage, ref, label, desc, visible, resettable, multiple = true, values = {}) {
        const convertedValues = convertValueList(values);
        const inputEl = document.createElement("emc-listselect");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "list");
        inputEl.multiple = multiple;
        inputEl.dataset.ref = ref;
        const valueCache = new Set();
        for (const value in convertedValues) {
            inputEl.append(generateEmcOption(value, convertedValues[value]));
            if (storage.get(value)) {
                valueCache.add(value);
            }
            // events
            storage.addEventListener("change", (event) => {
                const evValue = event.data[value];
                if (evValue != null) {
                    if (evValue) {
                        valueCache.add(value);
                    } else {
                        valueCache.delete(value);
                    }
                    inputEl.value = Array.from(valueCache);
                }
            });
        }
        inputEl.value = Array.from(valueCache);
        // events
        storage.addEventListener("clear", (event) => {
            valueCache.clear();
            for (const value in convertedValues) {
                const evValue = event.data[value];
                if (evValue) {
                    valueCache.add(value);
                }
            }
            inputEl.value = Array.from(valueCache);
        });
        storage.addEventListener("load", (event) => {
            valueCache.clear();
            for (const value in convertedValues) {
                const evValue = event.data[value];
                if (evValue) {
                    valueCache.add(value);
                }
            }
            inputEl.value = Array.from(valueCache);
        });
        inputEl.addEventListener("change", () => {
            const data = new Set(inputEl.value);
            const res = {};
            for (const value in convertedValues) {
                res[value] = data.has(value);
            }
            storage.setAll(res);
        });
        // add element
        const resetEl = resettable && createResetButton(() => {
            storage.resetAll(Object.keys(convertedValues));
        });
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addButton(storage, ref, label, desc, visible, text = "", callback = null) {
        const inputEl = document.createElement("button");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-button";
        inputEl.setAttribute("type", "button");
        inputEl.dataset.ref = ref;
        if (text instanceof HTMLElement) {
            inputEl.append(text);
        } else {
            inputEl.innerHTML = text;
        }
        if (typeof callback == "function") {
            inputEl.addEventListener("click", callback);
        }
        const labelEl = generateField(label, desc, inputEl, storage, visible);
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addCustomInput(inputEl, storage, ref, label, desc, visible, resettable) {
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "custom");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        // events
        storage.addEventListener("clear", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", (event) => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", (event) => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // add element
        const resetEl = resettable && createResetButton(storage, ref);
        const labelEl = generateField(label, desc, inputEl, storage, visible, resetEl);
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addElements(content) {
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(content);
    }

}

customElements.define("emc-window-settings-tab", SettingsTabContent);
