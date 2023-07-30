export default class Column extends HTMLElement {

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

    set type(value) {
        this.setAttribute("type", value);
    }

    get type() {
        return this.getAttribute("type");
    }

}

customElements.define("emc-grid-column", Column);
