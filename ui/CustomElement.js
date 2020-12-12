import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";

export default class CustomElement extends HTMLElement {

    constructor(template, style) {
        super();
        if (new.target === CustomElement) {
            throw new TypeError("can not construct abstract class");
        }
        this.attachShadow({mode: 'open'});
        if (template) {
            if (!(template instanceof Template)) {
                throw new TypeError("first parameter must be a Template");
            }
            this.shadowRoot.append(template.generate());
        }
        if (style) {
            if (!(style instanceof GlobalStyle)) {
                throw new TypeError("second parameter must be a GlobalStyle");
            }
            style.apply(this.shadowRoot);
        }
    }

}
