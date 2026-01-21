import DataList from "./DataList.js";
import ResizeObserverMixin from "../../mixin/ResizeObserverMixin.js";
import "../../i18n/I18nLabel.js";
import "./components/DataListEntry.js";

export default class LogList extends ResizeObserverMixin(DataList) {

    #scrollContainerEl;

    constructor() {
        super();
        /* --- */
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.registerTargetEventHandler(this.#scrollContainerEl, "scrollend", () => {
            const ev = new Event("scrollend", event);
            this.dispatchEvent(ev);
        });
        this.registerTargetEventHandler(this.#scrollContainerEl, "afterrender", () => {
            this.#applyAutoScroll();
        });
    }

    resizeCallback() {
        this.#applyAutoScroll();
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
                    this.#applyAutoScroll();
                } break;
            }
        }
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

    #applyAutoScroll() {
        if (this.autoscroll) {
            const scrollHeight = this.#scrollContainerEl.scrollHeight;
            this.#scrollContainerEl.scroll({top: scrollHeight});
        }
    }

}

customElements.define("emc-loglist", LogList);
