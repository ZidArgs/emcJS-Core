import CustomElement from "../../element/CustomElement.js";
import ResizeObserverMixin from "../../mixin/ResizeObserverMixin.js";
import DataRecieverMixin from "../../../util/dataprovider/DataRecieverMixin.js";
import ElementManager from "../../../util/html/ElementManager.js";
import BusyIndicator from "../../BusyIndicator.js";
import "../../i18n/I18nLabel.js";
import "./components/DataListEntry.js";
import TPL from "./DataList.js.html" assert {type: "html"};
import STYLE from "./DataList.js.css" assert {type: "css"};

// TODO add "no match" label
export default class DataList extends ResizeObserverMixin(DataRecieverMixin(CustomElement)) {

    #scrollContainerEl;

    #emptyContainerEl;

    #elementManager = new ElementManager(this);

    #busyIndicator = new BusyIndicator();

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
            this.#emptyContainerEl.classList.toggle("hidden", this.childNodes.length > 0);
            if (this.autoscroll) {
                const scrollHeight = this.#scrollContainerEl.scrollHeight;
                this.#scrollContainerEl.scroll({top: scrollHeight});
            }
        });
        this.#scrollContainerEl.addEventListener("scrollend", () => {
            const ev = new Event("scrollend", event);
            this.dispatchEvent(ev);
        });
    }

    resizeCallback() {
        if (this.autoscroll) {
            const scrollHeight = this.#scrollContainerEl.scrollHeight;
            this.#scrollContainerEl.scroll({top: scrollHeight});
        }
    }

    set autoscroll(val) {
        this.setBooleanAttribute("autoscroll", val);
    }

    get autoscroll() {
        return this.getBooleanAttribute("autoscroll");
    }

    static get observedAttributes() {
        return ["autoscroll"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "autoscroll": {
                    if (this.autoscroll) {
                        const scrollHeight = this.#scrollContainerEl.scrollHeight;
                        this.#scrollContainerEl.scroll({top: scrollHeight});
                    }
                } break;
            }
        }
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

    getVerticalScrollFactor() {
        const scrollHeight = this.#scrollContainerEl.scrollHeight;
        const clientHeight = this.#scrollContainerEl.clientHeight;
        const scrollTop = this.#scrollContainerEl.scrollTop;
        const currentScrollPosition = clientHeight + scrollTop;

        if (scrollHeight <= clientHeight) {
            return 1;
        }

        if (scrollHeight <= 0) {
            return 0;
        }

        return currentScrollPosition / scrollHeight;
    }

}

customElements.define("emc-datalist", DataList);
