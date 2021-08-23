import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import I18nMixin from "./I18nMixin.js";

const TPL = new Template(`
<span><slot></slot></span>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-flex;
    pointer-events: none;
    user-select: none;
    align-items: center;
    justify-content: center;
}
`);

export default class Label extends I18nMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    applyI18nTranslation(content) {
        super.innerText = content;
    }

    set innerHTML(value) {}

    get innerHTML() {
        return super.innerHTML;
    }

    set innerText(value) {}

    get innerText() {
        return super.innerText;
    }

    set textContent(value) {}

    get textContent() {
        return super.textContent;
    }

    append() {}

    prepend() {}

    appendChild() {}

    removeChild() {}

    replaceChild() {}

    replaceChildren() {}

}

customElements.define("emc-i18n-label", Label);
