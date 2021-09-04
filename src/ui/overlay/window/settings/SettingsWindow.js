import DefaultingStorage from "../../../../datastorage/DefaultingStorage.js";
import Template from "../../../../util/html/Template.js";
import GlobalStyle from "../../../../util/html/GlobalStyle.js";
import Window from "../Window.js";
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
* {
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

const STORAGE = new WeakMap();

export default class SettingsWindow extends Window {

    constructor(title = "Settings", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        STORAGE.set(this, new DefaultingStorage());
        const window = this.shadowRoot.getElementById("window");
        const body = this.shadowRoot.getElementById("body");
        body.innerHTML = "";
        const ctgrs = els.getElementById("categories");
        body.append(ctgrs);
        window.append(els.getElementById("footer"));

        ctgrs.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        }

        const sbm = this.shadowRoot.getElementById("submit");
        if (!!options.submit && typeof options.submit === "string") {
            sbm.innerHTML = options.submit;
            sbm.setAttribute("title", options.submit);
        }
        sbm.addEventListener("click", event => {
            const storage = STORAGE.get(this);
            const data = storage.getAll();
            const ev = new Event("submit");
            ev.data = data;
            this.dispatchEvent(ev);
            this.close();
        });

        const ccl = this.shadowRoot.getElementById("cancel");
        if (!!options.cancel && typeof options.cancel === "string") {
            ccl.innerHTML = options.cancel;
            ccl.setAttribute("title", options.cancel);
        }
        ccl.onclick = () => {
            this.dispatchEvent(new Event("cancel"));
            this.close();
        }
    }

    show(data = {}, category = "") {
        const categories = this.shadowRoot.getElementById("categories");
        if (category) {
            categories.active = category;
        } else {
            categories.active = "";
        }
        const storage = STORAGE.get(this);
        storage.setAll(data);
        super.show();
    }

    overwriteValues(data) {
        const storage = STORAGE.get(this);
        storage.deserialize(data);
    }

    getTab(category, label = category) {
        const categories = this.shadowRoot.getElementById("categories");
        const tab = categories.getTab(category);
        if (tab != null) {
            const container = tab.querySelector(".container");
            return container;
        } else {
            const tab = categories.setTab(category, label);
            const container = document.createElement("emc-window-settings-tab");
            container.className = "container";
            container.id = `settings_${category}`;
            tab.append(container);
            return container;
        }
    }

    addStringInput(category, label, ref, def, visible, resettable) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, def);
            panel.addStringInput(storage, label, ref, visible, resettable);
        }
    }

    addNumberInput(category, label, ref, def, visible, resettable, min, max) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, def);
            panel.addNumberInput(storage, label, ref, visible, resettable, min, max);
        }
    }

    addRangeInput(category, label, ref, def, visible, resettable, min, max) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, def);
            panel.addRangeInput(storage, label, ref, visible, resettable, min, max);
        }
    }

    addCheckInput(category, label, ref, def, visible, resettable) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, !!def);
            panel.addCheckInput(storage, label, ref, visible, resettable);
        }
    }

    addColorInput(category, label, ref, def, visible, resettable) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, def);
            panel.addColorInput(storage, label, ref, visible, resettable);
        }
    }

    addButton(category, label, ref, visible, text = "", callback = null) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addButton(storage, label, ref, visible, text, callback = null);
        }
    }

    addChoiceInput(category, label, ref, def, visible, resettable, values) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            storage.setDefault(ref, def);
            panel.addChoiceInput(storage, label, ref, visible, resettable, values);
        }
    }

    addListSelectInput(category, label, ref, def, visible, resettable, multiple, values) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            for (const value in values) {
                storage.setDefault(value, def.includes(value));
            }
            panel.addListSelectInput(storage, label, ref, visible, resettable, multiple, values);
        }
    }

    addElements(category, content) {
        const panel = this.getTab(category);
        if (panel != null) {
            panel.addElements(content);
        }
    }

}

customElements.define("emc-settingswindow", SettingsWindow);
