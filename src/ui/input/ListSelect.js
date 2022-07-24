import CustomElementDelegating from "../element/CustomElementDelegating.js";
import ListSelectionHelper from "../../util/helper/ui/ListSelectionHelper.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import "../header/SelectionHeader.js";
import "./Option.js";
import TPL from "./ListSelect.js.html" assert {type: "html"};
import STYLE from "./ListSelect.js.css" assert {type: "css"};

export default class ListSelect extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const containerEl = this.shadowRoot.getElementById("container");
        containerEl.addEventListener("slotchange", () => {
            const all = this.querySelectorAll(`[value]`);
            for (const el of all) {
                if (el) {
                    el.onclick = () => {
                        this.#choose(el.getAttribute("value"));
                    };
                }
            }
            this.calculateItems();
        });
        /* header */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("check", (event) => {
            if (this.multiple) {
                const all = this.querySelectorAll(`[value]`);
                const value = [];
                if (event.value) {
                    for (const el of all) {
                        if (!!el && el.style.display == "" || el.classList.contains("active")) {
                            value.push(el.value);
                        }
                    }
                } else {
                    for (const el of all) {
                        if (!!el && el.style.display == "none" && el.classList.contains("active")) {
                            value.push(el.value);
                        }
                    }
                }
                this.value = value;
            }
        });
        headerEl.addEventListener("search", (event) => {
            const all = this.querySelectorAll(`[value]`);
            let checked = false;
            let unchecked = false;
            if (event.value) {
                const regEx = new SearchAnd(event.value);
                if (this.style.height == "" || this.style.width == "") {
                    const rect = this.getBoundingClientRect();
                    this.style.width = `${rect.width}px`;
                    this.style.height = `${rect.height}px`;
                }
                for (const el of all) {
                    if (el.innerText.match(regEx)) {
                        el.style.display = "";
                        if (el.classList.contains("active")) {
                            checked = true;
                        } else {
                            unchecked = true;
                        }
                    } else {
                        el.style.display = "none";
                        el.classList.remove("marked");
                    }
                }
            } else {
                for (const el of all) {
                    el.style.display = "";
                    if (el.classList.contains("active")) {
                        checked = true;
                    } else {
                        unchecked = true;
                    }
                }
                this.style.width = "";
                this.style.height = "";
            }
            if (this.multiple) {
                if (checked) {
                    if (unchecked) {
                        headerEl.checked = "mixed";
                    } else {
                        headerEl.checked = true;
                    }
                } else {
                    headerEl.checked = false;
                }
            }
        });
        /* --- */
        const scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        const selectionHelper = new ListSelectionHelper(this, scrollContainerEl);
        selectionHelper.addEventListener("choose", (event) => {
            this.#choose(event.value);
        });
    }

    focus() {
        const headerEl = this.shadowRoot.getElementById("header");
        if (headerEl != null) {
            headerEl.focus();
        }
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        /* --- */
        const all = this.querySelectorAll(`[value]`);
        if (!this.value) {
            if (this.multiple) {
                this.value = [];
            } else if (all.length > 0) {
                this.value = all[0].value;
            }
        }
        for (const el of all) {
            if (el) {
                el.onclick = () => {
                    this.#choose(el.getAttribute("value"));
                };
            }
        }
        this.calculateItems();
    }

    serialize() {
        const res = {};
        const all = this.querySelectorAll(`[value]`);
        for (const el of all) {
            res[el.value] = el.classList.contains("active");
        }
        return res;
    }

    deserialize(values) {
        const res = [];
        for (const key in values) {
            if (values[key]) {
                res.push(key);
            }
        }
        this.value = res;
    }

    set value(val) {
        if (val != null) {
            if (this.multiple) {
                if (!Array.isArray(val)) {
                    val = [val];
                }
                val = JSON.stringify(val);
            } else if (Array.isArray(val)) {
                val = val[0];
            }
            this.setAttribute("value", val);
        } else {
            this.removeAttribute("value");
        }
    }

    get value() {
        let val = this.getAttribute("value");
        if (this.multiple) {
            if (val != null) {
                val = JSON.parse(val);
            } else {
                val = [];
            }
        }
        return val;
    }

    set multiple(val) {
        this.setAttribute("multiple", val);
    }

    get multiple() {
        return this.getAttribute("multiple") == "true";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    get readonly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    static get observedAttributes() {
        return ["value", "multiple"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value":
                if (oldValue != newValue) {
                    this.calculateItems();
                    const event = new Event("change");
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
                break;
            case "multiple":
                if (oldValue != newValue) {
                    if (newValue != "true") {
                        const arr = JSON.parse(this.getAttribute("value"));
                        if (arr.length > 1) {
                            this.value = arr[0];
                        }
                    } else {
                        const val = this.getAttribute("value");
                        if (val != null) {
                            this.value = [val];
                        } else {
                            this.value = [];
                        }
                    }
                    const header = this.shadowRoot.getElementById("header");
                    header.multiple = newValue;
                }
                break;
        }
    }

    resetSearch() {
        const header = this.shadowRoot.getElementById("header");
        header.search = "";
    }

    calculateItems() {
        const header = this.shadowRoot.getElementById("header");
        const all = this.querySelectorAll(`[value]`);
        if (this.multiple) {
            const vals = new Set(this.value);
            let checked = false;
            let unchecked = false;
            for (const el of all) {
                if (el) {
                    if (vals.has(el.value)) {
                        el.classList.add("active");
                        if (el.style.display == "") {
                            checked = true;
                        }
                    } else {
                        el.classList.remove("active");
                        if (el.style.display == "") {
                            unchecked = true;
                        }
                    }
                }
            }
            if (checked) {
                if (unchecked) {
                    header.checked = "mixed";
                } else {
                    header.checked = true;
                }
            } else {
                header.checked = false;
            }
        } else {
            for (const el of all) {
                if (el) {
                    if (this.value == el.value) {
                        el.classList.add("active");
                    } else {
                        el.classList.remove("active");
                    }
                }
            }
        }
    }

    #choose(value) {
        if (!this.readonly) {
            if (this.multiple) {
                const arr = this.value;
                const set = new Set(arr);
                if (set.has(value)) {
                    set.delete(value);
                } else {
                    set.add(value);
                }
                this.value = Array.from(set);
            } else {
                this.value = value;
            }
        }
    }

}

customElements.define("emc-listselect", ListSelect);
