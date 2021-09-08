import CustomDelegatingElement from "../CustomDelegatingElement.js";
//import SearchAnd from "../../util/search/SearchAnd.js";
//import SearchOr from "../../util/search/SearchOr.js";

const SEARCH_MODE_OR = new WeakMap();

export default class TableToolbar extends CustomDelegatingElement {

    constructor() {
        super();
        /* --- */
        SEARCH_MODE_OR.set(this, false);
    }

}

//customElements.define("emc-table-toolbar", TableToolbar);
