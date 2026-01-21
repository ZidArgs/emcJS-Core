import CustomElement from "../../element/CustomElement.js";
import DataReceiverMixin from "../../../util/dataprovider/DataReceiverMixin.js";
import ElementManager from "../../../util/html/ElementManager.js";
import {debounce} from "../../../util/Debouncer.js";
import BusyIndicator from "../../BusyIndicator.js";
import DataListEntry from "./components/DataListEntry.js";
import "../../i18n/I18nLabel.js";
import TPL from "./DataList.js.html" assert {type: "html"};
import STYLE from "./DataList.js.css" assert {type: "css"};

export default class DataList extends DataReceiverMixin(CustomElement) {

    #scrollContainerEl;

    #emptyContainerEl;

    #elementManager = new ElementManager(this);

    #busyIndicator = new BusyIndicator();

    #entries = new Map();

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#busyIndicator.setTarget(this.shadowRoot);
        /* --- */
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#emptyContainerEl = this.shadowRoot.getElementById("empty-container");
        this.#elementManager.composer = (key, values) => {
            const el = this.createListEntry();
            if (!(el instanceof DataListEntry)) {
                throw new Error("list elements must extend DataListEntry");
            }
            el.key = key;
            el.setData(values);
            this.#entries.set(key, el);
            return el;
        };
        this.#elementManager.mutator = (el, key, values) => {
            el.setData(values);
        };
        this.#elementManager.cleanup = (el, key) => {
            this.#entries.delete(key);
            this.removeListEntry(el);
        };
        this.registerTargetEventHandler(this.#elementManager, "afterrender", () => {
            this.#refreshEmptyStatus();
            const ev = new Event("afterrender", event);
            this.#scrollContainerEl.dispatchEvent(ev);
        });
        /* --- */
        this.#refreshEmptyStatus();
    }

    createListEntry() {
        return new DataListEntry();
    }

    removeListEntry() {
        // to override
    }

    getEntry(key) {
        return this.#entries.get(key);
    }

    getAllEntries() {
        return [...this.#entries.values()];
    }

    setData(records) {
        this.#elementManager.manage(records);
    }

    busy() {
        return this.#busyIndicator.busy();
    }

    unbusy() {
        return this.#busyIndicator.unbusy();
    }

    #refreshEmptyStatus = debounce(() => {
        if (this.#busyIndicator.isBusy()) {
            this.#refreshEmptyStatus();
        } else {
            const isEmpty = this.children.length === 0;
            this.#emptyContainerEl.classList.toggle("hidden", !isEmpty);
        }
    }, 1000);

}

customElements.define("emc-datalist", DataList);
