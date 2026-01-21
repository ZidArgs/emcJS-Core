import DataListEntry from "../../../../../dataview/datalist/components/DataListEntry.js";
import {debounce} from "../../../../../../util/Debouncer.js";
import TPL from "./SelectionListEntry.js.html" assert {type: "html"};
import STYLE from "./SelectionListEntry.js.css" assert {type: "css"};

export default class SelectionListEntry extends DataListEntry {

    #containerEl;

    #textEl;

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
        this.#textEl = this.shadowRoot.getElementById("text");
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
        this.#textEl.i18nValue = data.name;
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

    #renderCheckBox = debounce(() => {
        this.dispatchEvent(new Event("beforerender"));
        // add select cell
        if (this.#selectable) {
            if (this.#selectEnd) {
                this.#containerEl.append(this.#selectCheckboxEl);
            } else {
                this.#containerEl.prepend(this.#selectCheckboxEl);
            }
        } else {
            this.#selectCheckboxEl.remove();
        }
        this.dispatchEvent(new Event("afterrender"));
    });

}

customElements.define("emc-selectionlist-entry", SelectionListEntry);
