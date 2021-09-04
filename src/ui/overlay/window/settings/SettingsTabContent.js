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
label.settings-option {
    display: flex;
    padding: 10px;
    align-items: center;
    justify-content: flex-start;
}
label.settings-option:hover {
    background-color: lightgray;
}
label.settings-option input[type="checkbox"] {
    margin-right: 10px;
}
label.settings-option emc-listselect {
    max-height: 300px;
}
label.settings-option .settings-input:not([type="checkbox"]) {
    flex: 1;
}
label.settings-option .settings-input:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
label.settings-option .settings-input:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
}
label.settings-option .option-text {
    display: inline-block;
    flex-basis: 500px;
    flex-shrink: 1;
    margin-right: 10px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
label.settings-option .option-reset {
    display: inline-block;
    margin-left: auto;
}
`);

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
        inputEl.addEventListener("change", event => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addNumberInput(storage, label, ref, visible, resettable, min, max) {
        const inputEl = document.createElement("input");
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
        inputEl.addEventListener("change", event => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addRangeInput(storage, label, ref, visible, resettable, min, max) {
        const inputEl = document.createElement("input");
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
        inputEl.addEventListener("change", event => {
            storage.set(ref, parseFloat(inputEl.value));
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addCheckInput(storage, label, ref, visible, resettable) {
        const inputEl = document.createElement("input");
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
        inputEl.addEventListener("change", event => {
            storage.set(ref, !!inputEl.checked);
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addColorInput(storage, label, ref, visible, resettable) {
        const inputEl = document.createElement("input");
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
        inputEl.addEventListener("change", event => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addChoiceInput(storage, label, ref, visible, resettable, values = {}) {
        const inputEl = document.createElement("emc-searchselect");
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
        inputEl.addEventListener("change", event => {
            storage.set(ref, inputEl.value);
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addListSelectInput(storage, label, ref, visible, resettable, multiple = true, values = {}) {
        const inputEl = document.createElement("emc-listselect");
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
        inputEl.addEventListener("change", event => {
            const data = new Set(inputEl.value);
            const res = {};
            for (const value in values) {
                res[value] = data.has(value);
            }
            storage.setAll(res);
        });
        // reset
        if (resettable) {
            const resetEl = document.createElement("button");
            resetEl.innerHTML = "↺";
            resetEl.addEventListener("click", event => {
                storage.resetValue(ref);
            });
            const wrapperEl = document.createElement("emc-input-wrapper");
            wrapperEl.append(resetEl);
            labelEl.append(wrapperEl);
        }
        // add element
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.append(labelEl);
    }

    addButton(storage, label, ref, visible, text = "", callback = null) {
        const input = document.createElement("button");
        input.className = "settings-button";
        input.setAttribute("type", "button");
        input.dataset.ref = ref;
        if (text instanceof HTMLElement) {
            input.append(text);
        } else {
            input.innerHTML = text;
        }
        if (typeof callback == "function") {
            input.onclick = callback;
        }
        const el = generateField(label, input, storage, visible);
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addElements(content) {
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(content);
    }

}

customElements.define("emc-window-settings-tab", SettingsTabContent);

function generateField(label, input, storage, visible) {
    const labelEl = document.createElement("label");
    labelEl.className = "settings-option";
    const textEl = document.createElement("span");
    if (label instanceof HTMLElement) {
        textEl.append(label);
    } else {
        textEl.innerHTML = label;
    }
    textEl.className = "option-text";
    labelEl.append(textEl);
    const wrapperEl = document.createElement("emc-input-wrapper");
    wrapperEl.append(input);
    labelEl.append(wrapperEl);
    // visibility
    if (visible != null) {
        if (typeof visible == "object") {
            const logicFn = LogicCompiler.compile(visible);
            const value = !!logicFn(ref => storage.get(ref));
            if (!value) {
                labelEl.style.display = "none";
            }
            // event
            storage.addEventListener("change", event => {
                const value = !!logicFn(ref => storage.get(ref));
                labelEl.style.display = value ? "" : "none";
            });
        } else if (!visible) {
            labelEl.style.display = "none";
        }
    }
    // ---
    return labelEl;
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
