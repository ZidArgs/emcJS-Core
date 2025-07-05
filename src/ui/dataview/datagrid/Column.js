import CustomElement from "../../element/CustomElement.js";

export default class Column extends CustomElement {

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get label() {
        return this.getAttribute("label");
    }

    set hideLabel(value) {
        this.setBooleanAttribute("hidelabel", value);
    }

    get hideLabel() {
        return this.getBooleanAttribute("hidelabel");
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

    set sortable(value) {
        this.setBooleanAttribute("sortable", value);
    }

    get sortable() {
        return this.getBooleanAttribute("sortable");
    }

    set halign(value) {
        this.setAttribute("halign", value);
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set valign(value) {
        this.setAttribute("valign", value);
    }

    get valign() {
        return this.getAttribute("valign");
    }

    set fixed(value) {
        this.setAttribute("fixed", value);
    }

    get fixed() {
        return this.getAttribute("fixed");
    }

    set textcolor(value) {
        this.setAttribute("textcolor", value);
    }

    get textcolor() {
        return this.getAttribute("textcolor");
    }

    set backcolor(value) {
        this.setAttribute("backcolor", value);
    }

    get backcolor() {
        return this.getAttribute("backcolor");
    }

}

customElements.define("emc-datagrid-column", Column);
