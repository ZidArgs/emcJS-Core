import CustomElement from "../../element/CustomElement.js";

// TODO create enum for halign
// TODO create enum for valign
// TODO create enum for fixed
export default class Column extends CustomElement {

    set name(value) {
        this.setStringAttribute("name", value);
    }

    get name() {
        return this.getStringAttribute("name");
    }

    set label(value) {
        this.setStringAttribute("label", value);
    }

    get label() {
        return this.getStringAttribute("label");
    }

    set hideLabel(value) {
        this.setBooleanAttribute("hidelabel", value);
    }

    get hideLabel() {
        return this.getBooleanAttribute("hidelabel");
    }

    set type(value) {
        this.setStringAttribute("type", value);
    }

    get type() {
        return this.getStringAttribute("type");
    }

    set width(value) {
        this.setStringAttribute("width", value);
    }

    get width() {
        return this.getStringAttribute("width");
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

    set sortBy(value) {
        this.setStringAttribute("sortby", value);
    }

    get sortBy() {
        return this.getStringAttribute("sortby");
    }

    set nullable(value) {
        this.setBooleanAttribute("nullable", value);
    }

    get nullable() {
        return this.getBooleanAttribute("nullable");
    }

    set halign(value) {
        this.setStringAttribute("halign", value);
    }

    get halign() {
        return this.getStringAttribute("halign");
    }

    set valign(value) {
        this.setStringAttribute("valign", value);
    }

    get valign() {
        return this.getStringAttribute("valign");
    }

    set fixed(value) {
        this.setStringAttribute("fixed", value);
    }

    get fixed() {
        return this.getStringAttribute("fixed");
    }

    set textColor(value) {
        this.setStringAttribute("textcolor", value);
    }

    get textColor() {
        return this.getStringAttribute("textcolor");
    }

    set backColor(value) {
        this.setStringAttribute("backcolor", value);
    }

    get backColor() {
        return this.getStringAttribute("backcolor");
    }

}

customElements.define("emc-datagrid-column", Column);
