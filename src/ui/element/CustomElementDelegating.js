// import TPL from "./CustomElement.html" assert {type: "html"};
import STYLE from "./CustomElement.css" assert {type: "css"};

export default class CustomElementDelegating extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        STYLE.apply(this.shadowRoot);
    }

}
