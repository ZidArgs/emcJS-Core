// frameworks
import Template from "../../../../util/html/Template.js";
import GlobalStyle from "../../../../util/html/GlobalStyle.js";
import LogicCompiler from "../../../../util/logic/Compiler.js";
import "../../../input/ListSelect.js";
import "../../../input/SearchSelect.js";
import "../../../input/Option.js";
import "../../../input/InputWrapper.js";


const TPL = new Template(`
<div id="container"></div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host() {
    display: block;
    overflow-wrap: break-word;
    resize: none;
}
.settings-option {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 40px;
}
.settings-option:hover {
    background-color: lightgray;
}
.settings-option input[type="checkbox"] {
    margin-right: 10px;
}
.settings-option emc-listselect {
    max-height: 300px;
}
.settings-option .settings-input:not([type="checkbox"]) {
    flex: 1;
}
.settings-option .settings-input:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
.settings-option .settings-input:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
}
.settings-option .option-text {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-basis: 500px;
    flex-shrink: 1;
    padding: 10px;
    cursor: pointer;
    user-select: none;
}
.settings-option .option-reset button {
    margin-left: auto;
}
.settings-option .align-top {
    align-self: flex-start;
}
`);

function generateField(label, input, storage, visible) {
    const fieldEl = document.createElement("div");
    fieldEl.className = "settings-option";
    // label
    const labelEl = document.createElement("label");
    labelEl.className = "option-text";
    labelEl.setAttribute("for", input.id);
    if (label instanceof HTMLElement) {
        labelEl.append(label);
    } else {
        labelEl.innerHTML = label;
    }
    fieldEl.append(labelEl);
    // input
    const wrapperEl = document.createElement("emc-input-wrapper");
    wrapperEl.append(input);
    fieldEl.append(wrapperEl);
    // visibility
    if (visible != null) {
        if (typeof visible == "object") {
            const logicFn = LogicCompiler.compile(visible);
            const value = !!logicFn(ref => storage.get(ref));
            if (!value) {
                fieldEl.style.display = "none";
            }
            // event
            storage.addEventListener("change", () => {
                const value = !!logicFn(ref => storage.get(ref));
                fieldEl.style.display = value ? "" : "none";
            });
        } else if (!visible) {
            fieldEl.style.display = "none";
        }
    }
    // ---
    return fieldEl;
}

function createResetButton(storage, ref) {
    const resetEl = document.createElement("button");
    resetEl.innerHTML = "↺";
    resetEl.addEventListener("click", () => {
        storage.resetValue(ref);
    });
    const wrapperEl = document.createElement("emc-input-wrapper");
    wrapperEl.className = "option-reset";
    wrapperEl.append(resetEl);
    return wrapperEl;
}

function generateEmcOption(value, label) {
    const el = document.createElement("emc-option");
    el.value = value;
    if (label instanceof HTMLElement) {
        el.append(label);
    } else {
        el.innerHTML = label;
    }
    return el;
}

export default class SettingsTabContent extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    addStringInput(storage, label, ref, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "text");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref);
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addNumberInput(storage, label, ref, visible, resettable, min, max) {
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
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("load", event => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.value = parseFloat(event.data[ref]) || 0;
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref);
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addRangeInput(storage, label, ref, visible, resettable, min, max) {
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
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("load", event => {
            inputEl.value = parseFloat(event.data[ref]) || 0;
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.value = parseFloat(event.data[ref]) || 0;
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref)
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addCheckInput(storage, label, ref, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "checkbox");
        inputEl.checked = !!storage.get(ref);
        inputEl.dataset.ref = ref;
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = !!event.data[ref];
        });
        storage.addEventListener("load", event => {
            inputEl.value = !!event.data[ref];
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.checked = !!event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, !!inputEl.checked);
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref);
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addColorInput(storage, label, ref, visible, resettable) {
        const inputEl = document.createElement("input");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "color");
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref);
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addChoiceInput(storage, label, ref, visible, resettable, values = {}) {
        const inputEl = document.createElement("emc-searchselect");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "input");
        for (const value in values) {
            inputEl.append(generateEmcOption(value, values[value]));
        }
        inputEl.value = storage.get(ref);
        inputEl.dataset.ref = ref;
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("load", event => {
            inputEl.value = event.data[ref];
        });
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                inputEl.value = event.data[ref];
            }
        });
        inputEl.addEventListener("change", () => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = createResetButton(storage, ref);
            labelEl.append(resetEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addListSelectInput(storage, label, ref, visible, resettable, multiple = true, values = {}) {
        const inputEl = document.createElement("emc-listselect");
        inputEl.id = `${this.id}_${ref}`;
        inputEl.className = "settings-input";
        inputEl.setAttribute("type", "list");
        inputEl.multiple = multiple;
        inputEl.dataset.ref = ref;
        const valueCache = new Set();
        for (const value in values) {
            inputEl.append(generateEmcOption(value, values[value]));
            if (storage.get(value)) {
                valueCache.add(value);
            }
            // events
            storage.addEventListener("change", event => {
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
        const labelEl = generateField(label, inputEl, storage, visible);
        // events
        storage.addEventListener("clear", event => {
            valueCache.clear();
            for (const value in values) {
                const evValue = event.data[value];
                if (evValue) {
                    valueCache.add(value);
                }
            }
            inputEl.value = Array.from(valueCache);
        });
        storage.addEventListener("load", event => {
            valueCache.clear();
            for (const value in values) {
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
            for (const value in values) {
                res[value] = data.has(value);
            }
            storage.setAll(res);
        });
        // reset
        // TODO implement reset functionality
        // if (resettable) {
        //     const resetEl = createResetButton(storage, ref);
        //     resetEl.classList.add("align-top");
        //     labelEl.append(resetEl);
        // }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addButton(storage, label, ref, visible, text = "", callback = null) {
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
        const labelEl = generateField(label, inputEl, storage, visible);
        // add element
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
