import CustomElement from "../../element/CustomElement.js";

export default class Column extends CustomElement {

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set caption(value) {
        this.setAttribute("caption", value);
    }

    get caption() {
        return this.getAttribute("caption");
    }

    set type(value) {
        this.setAttribute("type", value);
    }

    get type() {
        return this.getAttribute("type");
    }

    set width(value) {
        this.setIntAttribute("width", value);
    }

    get width() {
        return this.getIntAttribute("width");
    }

    set editable(value) {
        this.setBooleanAttribute("editable", value);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

    set hidden(value) {
        this.setBooleanAttribute("hidden", value);
    }

    get hidden() {
        return this.getBooleanAttribute("hidden");
    }

}

customElements.define("emc-datagrid-column", Column);
