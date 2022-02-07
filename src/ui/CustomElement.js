import GlobalStyle from "../util/html/GlobalStyle.js";

const STYLE = new GlobalStyle(`
* {
    box-sizing: border-box;
}
:host {
    position: relative;
    box-sizing: border-box;
}
`);

export default class CustomElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        STYLE.apply(this.shadowRoot);
    }

}
