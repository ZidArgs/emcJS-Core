import ObservableDefaultingStorage from "../../../../data/storage/observable/ObservableDefaultingStorage.js";
import Template from "../../../../util/html/Template.js";
import GlobalStyle from "../../../../util/html/GlobalStyle.js";
import Window from "../Window.js";
import I18nLabel from "../../../i18n/I18nLabel.js";
import "../../../layout/panel/TabPanel.js";
import "../../../input/ListSelect.js";
import "./SettingsTabContent.js";

const TPL = new Template(`
<emc-panel-tabpanel id="categories">
</emc-panel-tabpanel>
<div id="footer">
    <button id="submit" title="submit">
        submit
    </button>
    <button id="cancel" title="cancel">
        cancel
    </button>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    position: relative;
    box-sizing: border-box;
}
#body {
    height: 50vh;
}
#footer,
#submit,
#cancel {
    display: flex;
}
#categories {
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
}
#footer {
    height: 50px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
#submit,
#cancel {
    margin-left: 10px;
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-appearance: none;
}
#submit:hover,
#cancel:hover {
    color: white;
    background-color: black;
}
`);

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

export default class SettingsWindow extends Window {

    #storage = new ObservableDefaultingStorage();

    constructor(title = "Settings", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const windowEl = this.shadowRoot.getElementById("window");
        const bodyEl = this.shadowRoot.getElementById("body");
        bodyEl.innerHTML = "";
        const categoriesEl = els.getElementById("categories");
        bodyEl.append(categoriesEl);
        windowEl.append(els.getElementById("footer"));

        categoriesEl.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        }

        const submitEl = this.shadowRoot.getElementById("submit");
        if (!!options.submit && typeof options.submit === "string") {
            submitEl.innerHTML = options.submit;
            submitEl.setAttribute("title", options.submit);
        }
        submitEl.addEventListener("click", () => this.submit());

        const cancelEl = this.shadowRoot.getElementById("cancel");
        if (!!options.cancel && typeof options.cancel === "string") {
            cancelEl.innerHTML = options.cancel;
            cancelEl.setAttribute("title", options.cancel);
        }
        cancelEl.addEventListener("click", () => this.cancel());
    }

    show(data = {}, category = "") {
        const categoriesEl = this.shadowRoot.getElementById("categories");
        if (category) {
            categoriesEl.active = category;
        } else {
            categoriesEl.active = "";
        }
        this.#storage.setAll(data);
        super.show();
    }

    submit() {
        const data = this.#storage.getAll();
        const ev = new Event("submit");
        ev.data = data;
        this.dispatchEvent(ev);
        this.remove();
    }

    cancel() {
        this.dispatchEvent(new Event("cancel"));
        this.remove();
    }

    overwriteValues(data) {
        this.#storage.deserialize(data);
    }

    getTab(category, label = category) {
        const categoriesEl = this.shadowRoot.getElementById("categories");
        const tabEl = categoriesEl.getTab(category);
        if (tabEl != null) {
            const containerEl = tabEl.querySelector(".container");
            return containerEl;
        } else {
            const tabEl = categoriesEl.setTab(category, I18nLabel.getLabel(label));
            const containerEl = document.createElement("emc-window-settings-tab");
            containerEl.className = "container";
            containerEl.id = `settings_${category}`;
            tabEl.append(containerEl);
            return containerEl;
        }
    }

    addStringInput(category, ref, label, desc, def, visible, resettable) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, def);
            tabEl.addStringInput(this.#storage, ref, label, desc, visible, resettable);
        }
    }

    addNumberInput(category, ref, label, desc, def, visible, resettable, min, max) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, def);
            tabEl.addNumberInput(this.#storage, ref, label, desc, visible, resettable, min, max);
        }
    }

    addRangeInput(category, ref, label, desc, def, visible, resettable, min, max) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, def);
            tabEl.addRangeInput(this.#storage, ref, label, desc, visible, resettable, min, max);
        }
    }

    addCheckInput(category, ref, label, desc, def, visible, resettable) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, !!def);
            tabEl.addCheckInput(this.#storage, ref, label, desc, visible, resettable);
        }
    }

    addColorInput(category, ref, label, desc, def, visible, resettable) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, def);
            tabEl.addColorInput(this.#storage, ref, label, desc, visible, resettable);
        }
    }

    addChoiceInput(category, ref, label, desc, def, visible, resettable, values) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            this.#storage.setDefault(ref, def);
            tabEl.addChoiceInput(this.#storage, ref, label, desc, visible, resettable, values);
        }
    }

    addListSelectInput(category, ref, label, desc, def, visible, resettable, multiple, values) {
        const convertedValues = convertValueList(values);
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            for (const value in convertedValues) {
                this.#storage.setDefault(value, def.includes(value));
            }
            tabEl.addListSelectInput(this.#storage, ref, label, desc, visible, resettable, multiple, convertedValues);
        }
    }

    addButton(category, ref, label, desc, visible, text = "", callback = null) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            tabEl.addButton(this.#storage, ref, label, desc, visible, text, callback = null);
        }
    }

    addElements(category, content) {
        const tabEl = this.getTab(category);
        if (tabEl != null) {
            tabEl.addElements(content);
        }
    }

}

customElements.define("emc-settingswindow", SettingsWindow);
