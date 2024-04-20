import CustomElement from "/emcJS/ui/element/CustomElement.js";
import DataRecieverMixin from "/emcJS/util/dataprovider/DataRecieverMixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import BusyIndicator from "../../BusyIndicator.js";
import "./components/DataListEntry.js";
import TPL from "./DataList.js.html" assert {type: "html"};
import STYLE from "./DataList.js.css" assert {type: "css"};

export default class DataList extends DataRecieverMixin(CustomElement) {

    #emptyEl;

    #elementManager = new ElementManager(this);

    #busyIndicator = new BusyIndicator();

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#busyIndicator.setTarget(this.shadowRoot);
        /* --- */
        this.#emptyEl = this.shadowRoot.getElementById("empty");
        this.#elementManager.composer = (key, values) => {
            const el = this.createListEntry();
            if (typeof el.setData !== "function") {
                throw new Error("list elements must implement a setData function");
            }
            el.setData(values);
            return el;
        };
        this.#elementManager.mutator = (el, key, values) => {
            el.setData(values);
        };
        this.#elementManager.addEventListener("afterrender", () => {
            this.#emptyEl.classList.toggle("hidden", this.childNodes.length > 0);
        });
    }

    setData(records) {
        this.#elementManager.manage(records);
    }

    createListEntry() {
        return document.createElement("emc-datalist-entry");
    }

    busy() {
        return this.#busyIndicator.busy();
    }

    unbusy() {
        return this.#busyIndicator.unbusy();
    }

    reset() {
        return this.#busyIndicator.reset();
    }

}

customElements.define("emc-datalist", DataList);
