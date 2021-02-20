import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";
import SearchAnd from "../util/search/SearchAnd.js";
import "./header/SearchHeader.js";

const TPL = new Template(`
<emc-header-search id="header" multiple="false"></emc-header-search>
<div id="scroll-container">
    <slot id="container">
        <div id="empty">no entries</div>
    </slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 200px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    overflow: hidden;
}
:focus {
    outline: none;
}
#scroll-container {
    flex: 1;
    overflow-x: hidden;
    overflow-y: scroll;
    background-color: var(--list-color-back, #ffffff);
    scrollbar-color: var(--list-color-hover, #b8b8b8) var(--list-color-border, #f1f1f1);
}
#scroll-container::-webkit-scrollbar-track {
    background-color: var(--list-color-border, #f1f1f1);
}
#scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--list-color-hover, #b8b8b8);
}
slot {
    display: block;
    width: 100%;
}
#empty {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
    min-height: 30px;
    padding: 5px;
    margin: 5px 2px;
    white-space: normal;
}
`);

export default class FilteredList extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const header = this.shadowRoot.getElementById("header");
        this.shadowRoot.getElementById("container").addEventListener("slotchange", event => {
            // TODO only check new elements
            // TODO reset removed elements
            // header.search
        });
        /* header */
        header.addEventListener("search", event => {
            const all = this.querySelectorAll(`[data-filtervalue]`);
            const panels = this.querySelectorAll(`emc-collapsepanel`);
            if (event.value) {
                const regEx = new SearchAnd(event.value);
                all.forEach(el => {
                    if (el.dataset.filtervalue.match(regEx)) {
                        el.style.display = "";
                    } else {
                        el.style.display = "none";
                    }
                });
                panels.forEach(el => {
                    const children = el.querySelectorAll(`[data-filtervalue]`);
                    for (const ch of children) {
                        if (ch.style.display == "") {
                            el.style.display = "";
                            return;
                        }
                    }
                    el.style.display = "none";
                });
            } else {
                all.forEach(el => {
                    el.style.display = "";
                });
                panels.forEach(el => {
                    el.style.display = "";
                });
            }
        });
    }

}

customElements.define("emc-filteredlist", FilteredList);
