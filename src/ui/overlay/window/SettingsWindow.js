import Template from "../../../util/html/Template.js";
import GlobalStyle from "../../../util/html/GlobalStyle.js";
import Window from "./Window.js";
import "../../input/ListSelect.js";

const TPL = new Template(`
<div id="categories">
</div>
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
#footer,
#submit,
#cancel {
    display: flex;
}
#categories {
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
.category {
    display: inline-flex;
    margin: 0 2px;
}
.panel {
    display: none;
    word-wrap: break-word;
    resize: none;
}
.panel.active {
    display: block;
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
    -webkit-appearance: none;
}
.category {
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
}
.category:hover {
    background-color: gray;
}
#submit:hover,
#cancel:hover,
.category.active {
    color: white;
    background-color: black;
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
input[type="checkbox"] {
    margin-right: 10px;
}
emc-listselect {
    height: 300px;
}
.settings-input {
    width: 50%;
}
.option-text {
    display: inline-block;
    flex-basis: 500px;
    flex-shrink: 1;
    margin-right: 10px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
`);

function settingsSubmit() {
    const data = {};
    Array.from(this.shadowRoot.querySelectorAll(".panel[data-ref]")).forEach(i => {
        data[i.dataset.ref] = data[i.dataset.ref] || {};
        Array.from(i.querySelectorAll(".settings-input[data-ref]")).forEach(j => {
            switch (j.type) {
                case "checkbox":
                    data[i.dataset.ref][j.dataset.ref] = j.checked;
                    break;
                case "number":
                case "range":
                    data[i.dataset.ref][j.dataset.ref] = parseFloat(j.value);
                    break;
                default:
                    data[i.dataset.ref][j.dataset.ref] = j.value;
                    break;
            }
        });
    });
    const ev = new Event("submit");
    ev.data = data;
    this.dispatchEvent(ev);
    this.close();
}

export default class SettingsWindow extends Window {

    constructor(title = "Settings", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const window = this.shadowRoot.getElementById("window");
        this.shadowRoot.getElementById("body").innerHTML = "";
        const ctgrs = els.getElementById("categories");
        window.insertBefore(ctgrs, this.shadowRoot.getElementById("body"));
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
        sbm.onclick = settingsSubmit.bind(this);

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

    get active() {
        return this.getAttribute("active");
    }

    set active(val) {
        this.setAttribute("active", val);
    }

    static get observedAttributes() {
        return ["active"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (oldValue) {
                const ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                if (ol) {
                    ol.classList.remove("active");
                }
                const ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                if (ob) {
                    ob.classList.remove("active");
                }
            }
            const nl = this.shadowRoot.getElementById(`panel_${newValue}`);
            if (nl) {
                nl.classList.add("active");
            }
            const nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
            if (nb) {
                nb.classList.add("active");
            }
        }
    }

    show(data = {}, category = "") {
        super.show();
        for (const i in data) {
            const b = this.shadowRoot.getElementById(`panel_${i}`);
            if (!b) continue;
            for (const j in data[i]) {
                const e = b.querySelector(`[data-ref="${j}"]`);
                if (!e) continue;
                if (e.type === "checkbox") {
                    e.checked = !!data[i][j];
                } else {
                    e.value = data[i][j];
                }
            }
        }
        if (category) {
            this.active = category;
        } else if (!this.active) {
            const ctg = this.shadowRoot.getElementById("categories").children;
            if (ctg.length) {
                this.active = ctg[0].getAttribute("target");
            }
        }
    }

    addTab(title, id) {
        const pnl = document.createElement("div");
        pnl.className = "panel";
        pnl.id = `panel_${id}`;
        pnl.dataset.ref = id;
        this.shadowRoot.getElementById("body").append(pnl);
        const cb = document.createElement("div");
        cb.className = "category";
        cb.setAttribute("target", id);
        cb.innerHTML = title;
        this.shadowRoot.getElementById("categories").append(cb);
    }

    addStringInput(category, label, ref, def) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "text");
        input.value = def;
        input.dataset.ref = ref;
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addNumberInput(category, label, ref, def, min, max) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "number");
        input.value = def;
        if (!isNaN(min)) {
            input.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            input.setAttribute("max", max);
        }
        input.dataset.ref = ref;
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addRangeInput(category, label, ref, def, min, max) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "range");
        input.value = def;
        if (!isNaN(min)) {
            input.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            input.setAttribute("max", max);
        }
        input.dataset.ref = ref;
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addCheckInput(category, label, ref, def) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "checkbox");
        input.checked = !!def;
        input.dataset.ref = ref;
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addChoiceInput(category, label, ref, def, values) {
        const el = generateField(label);
        const input = document.createElement("select");
        input.className = "settings-input";
        input.setAttribute("type", "input");
        for (const value in values) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.innerHTML = values[value];
            input.append(opt);
        }
        input.value = def;
        input.dataset.ref = ref;
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addListSelectInput(category, label, ref, def, multiple, values) {
        const el = generateField(label);
        const input = document.createElement("emc-listselect");
        input.className = "settings-input";
        input.setAttribute("type", "list");
        input.multiple = multiple;
        input.value = def;
        input.dataset.ref = ref;
        for (const value in values) {
            const opt = document.createElement("emc-option");
            opt.value = value;
            opt.innerHTML = values[value];
            input.append(opt);
        }
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addButton(category, label, ref, text = "", callback = null) {
        const el = generateField(label);
        const input = document.createElement("button");
        input.className = "settings-button";
        input.setAttribute("type", "button");
        input.dataset.ref = ref;
        input.innerHTML = text;
        if (typeof callback == "function") {
            input.onclick = callback;
        }
        el.append(input);
        this.shadowRoot.getElementById(`panel_${category}`).append(el);
    }

    addElements(category, content) {
        this.shadowRoot.getElementById(`panel_${category}`).append(content);
    }

}

customElements.define("emc-settingswindow", SettingsWindow);

function generateField(label) {
    const el = document.createElement("label");
    el.className = "settings-option";
    const text = document.createElement("span");
    text.innerHTML = label;
    text.className = "option-text";
    el.append(text);
    return el;
}
