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

export default class CustomDelegatingElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        STYLE.apply(this.shadowRoot);
    }

}



