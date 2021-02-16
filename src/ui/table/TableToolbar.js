import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
//import SearchAnd from "../../util/search/SearchAnd.js";
//import SearchOr from "../../util/search/SearchOr.js";

const TPL = new Template(`

`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {

}
`);

const SEARCH_MODE_OR = new WeakMap();

export default class TableToolbar extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        SEARCH_MODE_OR.set(this, false);
    }

}

//customElements.define("emc-table-toolbar", TableToolbar);
