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

    set editable(value) {
        this.setBooleanAttribute("editable", value);
    }

    get editable() {
        return this.getBooleanAttribute("editable");
    }

}

customElements.define("emc-datagrid-column", Column);
