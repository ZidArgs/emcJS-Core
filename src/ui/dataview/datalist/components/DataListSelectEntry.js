import DataListEntry from "./DataListEntry.js";
import TPL from "./DataListSelectEntry.js.html" assert {type: "html"};
import STYLE from "./DataListSelectEntry.js.css" assert {type: "css"};

export default class DataListSelectEntry extends DataListEntry {

    #containerEl;

    #contentEl;

    #selectable = false;

    #selectEnd = false;

    #selectCheckboxEl;

    constructor() {
        super();
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#containerEl.append(els);
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.registerTargetEventHandler(this.#containerEl, "click", (event) => {
            if (event.target !== this.#selectCheckboxEl) {
                this.#selectCheckboxEl.click();
            }
            event.stopPropagation();
        }, {passive: true});
        /* --- */
        this.#selectCheckboxEl = document.createElement("input");
        this.#selectCheckboxEl.type = "checkbox";
        this.#selectCheckboxEl.name = "rowselect";
        this.registerTargetEventHandler(this.#selectCheckboxEl, "change", (event) => {
            event.stopPropagation();
            const ev = new Event("selection", {
                bubbles: true,
                cancelable: true
            });
            ev.data = {
                value: this.#selectCheckboxEl.checked,
                key: this.key
            };
            this.dispatchEvent(ev);
        }, {passive: true});
    }

    setData(data) {
        this.#contentEl.innerHTML = "";
        this.#contentEl.innerText = `${this.key}\n${JSON.stringify(data, null, 4)}`;
    }

    set selected(value) {
        this.#selectCheckboxEl.checked = !!value;
    }

    get selected() {
        return this.#selectCheckboxEl.checked;
    }

    set selectable(value) {
        value = !!value;
        if (this.#selectable !== value) {
            this.#selectable = value;
            this.#renderCheckBox();
        }
    }

    get selectable() {
        return this.#selectable;
    }

    set selectEnd(value) {
        value = !!value;
        if (this.#selectEnd !== value) {
            this.#selectEnd = value;
            this.#renderCheckBox();
        }
    }

    get selectEnd() {
        return this.#selectEnd;
    }

    set disabled(val) {
        this.setBooleanAttribute("disabled", val);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    #renderCheckBox() {
        if (this.#selectable) {
            if (this.#selectEnd) {
                this.#containerEl.append(this.#selectCheckboxEl);
            } else {
                this.#containerEl.prepend(this.#selectCheckboxEl);
            }
        } else {
            this.#selectCheckboxEl.remove();
        }
    }

}

customElements.define("emc-datalist-select-entry", DataListSelectEntry);
