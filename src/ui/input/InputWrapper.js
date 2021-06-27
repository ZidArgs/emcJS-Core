import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: contents;
}
::slotted(*) {
    position: relative;
    box-sizing: border-box;
    margin: 5px;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border: solid 1px var(--input-border-color, #000000);
    border-radius: 2px;
    font-size: 1rem;
}
::slotted(textarea) {
    padding: 7px;
}
::slotted(input:focus),
::slotted(select:focus),
::slotted(textarea:focus),
::slotted(button:focus),
::slotted(a:focus) {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
::slotted(input:focus:not(:focus-visible)),
::slotted(select:focus:not(:focus-visible)),
::slotted(textarea:focus:not(:focus-visible)),
::slotted(button:focus:not(:focus-visible)),
::slotted(a:focus:not(:focus-visible)) {
    box-shadow: none;
    outline: none;
}
::slotted(input:not([type])),
::slotted(input[type="text"]),
::slotted(input[type="password"]),
::slotted(input[type="search"]),
::slotted(input[type="url"]),
::slotted(input[type="email"]),
::slotted(input[type="tel"]),
::slotted(input[type="time"]),
::slotted(input[type="date"]),
::slotted(input[type="week"]),
::slotted(input[type="month"]),
::slotted(input[type="datetime-local"]),
::slotted(input[type="number"]),
::slotted(select),
::slotted(input[type="button"]),
::slotted(input[type="reset"]),
::slotted(input[type="submit"]),
::slotted(input[type="color"]),
::slotted(button),
::slotted(a) {
    height: 2rem;
    padding: 0px 7px;
}
::slotted(input[type="checkbox"]),
::slotted(input[type="button"]),
::slotted(input[type="reset"]),
::slotted(input[type="submit"]),
::slotted(input[type="color"]),
::slotted(button),
::slotted(a) {
    cursor: pointer;
}
::slotted(input[type="button"]:hover),
::slotted(input[type="reset"]:hover),
::slotted(input[type="submit"]:hover),
::slotted(input[type="color"]:hover),
::slotted(button:hover),
::slotted(a:hover) {
    color: var(--input-back-color, #ffffff);
    background-color: var(--input-text-color, #000000);
}
::slotted(a) {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
}
::slotted(a):after {
    display: inline-flex;
    align-items: center;
    margin-left: 5px;
    font-size: 1.5em;
    line-height: 1em;
    content: "\uD83D\uDD17\uFE0E";
}
::slotted(input[type="checkbox"]) {
    flex-shrink: 0;
    width: 3rem;
    height: 1.5rem;
    background-color: var(--input-back-color, #ffffff);
    border-radius: 1rem;
    appearance: none;
}
::slotted(input[type="checkbox"]):after {
    position: absolute;
    box-sizing: border-box;
    display: block;
    width: 50%;
    height: 100%;
    background-color: var(--input-button-color, #cccccc);
    border-radius: 50%;
    content: "";
}
::slotted(input[type="checkbox"]:indeterminate) {
    background-color: var(--input-color-hover, #999999);
}
::slotted(input[type="checkbox"]:indeterminate):after {
    left: 25%;
}
::slotted(input[type="checkbox"]:checked) {
    background-color: var(--input-text-color, #000000);
}
::slotted(input[type="checkbox"]:checked):after {
    left: 50%;
}
::slotted(input[type="radio"]) {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    background-color: var(--input-back-color, #ffffff);
    border: solid 1px var(--input-border-color, #000000);
    border-radius: 1rem;
    appearance: none;
}
::slotted(input[type="radio"]:checked):after {
    position: absolute;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    background-color: var(--input-text-color, #000000);
    border: solid 5px var(--input-back-color, #ffffff);
    border-radius: 50%;
    content: "";
}
`);

export default class InputWrapper extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

customElements.define("emc-input-wrapper", InputWrapper);
