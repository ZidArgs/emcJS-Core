import CustomElement from "./element/CustomElement.js";
import SearchAnd from "../util/search/SearchAnd.js";
import "./header/SearchHeader.js";
import TPL from "./FilteredList.js.html" assert {type: "html"};
import STYLE from "./FilteredList.js.css" assert {type: "css"};

export default class FilteredList extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const header = this.shadowRoot.getElementById("header");
        this.shadowRoot.getElementById("container").addEventListener("slotchange", () => {
            // TODO only check new elements
            // TODO reset removed elements
            // header.search
        });
        /* header */
        header.addEventListener("search", (event) => {
            const all = this.querySelectorAll(`[data-filtervalue]`);
            const panels = this.querySelectorAll(`emc-collapsepanel`);
            if (event.value) {
                const regEx = new SearchAnd(event.value);
                for (const el of all) {
                    if (el.dataset.filtervalue.match(regEx)) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                    }
                }
                for (const el of panels) {
                    const children = el.querySelectorAll(`[data-filtervalue]`);
                    for (const ch of children) {
                        if (ch.style.display == "") {
                            el.style.display = "";
                            return;
                        }
                    }
                    el.style.display = "none";
                }
            } else {
                for (const el of all) {
                    el.style.display = "";
                }
                for (const el of panels) {
                    el.style.display = "";
                }
            }
        });
    }

}

customElements.define("emc-filteredlist", FilteredList);
