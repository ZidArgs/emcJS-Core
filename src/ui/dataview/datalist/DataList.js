import CustomElement from "../../element/CustomElement.js";
import ResizeObserverMixin from "../../mixin/ResizeObserverMixin.js";
import DataReceiverMixin from "../../../util/dataprovider/DataReceiverMixin.js";
import ElementManager from "../../../util/html/ElementManager.js";
import BusyIndicator from "../../BusyIndicator.js";
import "../../i18n/I18nLabel.js";
import "./components/DataListEntry.js";
import TPL from "./DataList.js.html" assert {type: "html"};
import STYLE from "./DataList.js.css" assert {type: "css"};
import {debounce} from "../../../util/Debouncer.js";

// TODO add "no match" label
export default class DataList extends ResizeObserverMixin(DataReceiverMixin(CustomElement)) {

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
            el.key = key;
            el.setData(values);
            return el;
        };
        this.#elementManager.mutator = (el, key, values) => {
            el.setData(values);
        };
        this.registerTargetEventHandler(this.#elementManager, "afterrender", () => {
            this.#refreshEmptyStatus();
            if (this.autoscroll) {
                const scrollHeight = this.#scrollContainerEl.scrollHeight;
                this.#scrollContainerEl.scroll({top: scrollHeight});
            }
        });
        this.registerTargetEventHandler(this.#scrollContainerEl, "scrollend", () => {
            const ev = new Event("scrollend", event);
            this.dispatchEvent(ev);
        });
        /* --- */
        this.#refreshEmptyStatus();
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
