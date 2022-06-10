// import TPL from "./CustomElement.html" assert {type: "html"};
import STYLE from "./CustomElement.css" assert {type: "css"};

export default class CustomElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        STYLE.apply(this.shadowRoot);
    }

}
