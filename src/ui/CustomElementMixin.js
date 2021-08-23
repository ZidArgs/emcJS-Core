import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";

export default (CLAZZ) => class CustomElementMixin extends CLAZZ {

    constructor(...args) {
        super(...args);
        this.attachShadow({mode: "open"});
        /* template */
        const template = this.renderTemplate();
        if (template instanceof Template) {
            this.shadowRoot.append(template.generate());
        }
        /* style */
        const style = this.applyStyle();
        if (style instanceof GlobalStyle) {
            style.apply(this.shadowRoot);
        }
    }

    renderTemplate() {
        // nothing
    }

    applyStyle() {
        // nothing
    }

}
