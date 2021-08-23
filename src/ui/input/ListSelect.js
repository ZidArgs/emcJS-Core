import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import "../header/SelectionHeader.js";
import "./Option.js";

const TPL = new Template(`
<emc-header-selection id="header"></emc-header-selection>
<div id="scroll-container">
    <slot id="container">
        <div id="empty">no entries</div>
    </slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 100px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    overflow: hidden;
}
:host(:focus) {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
:host(:focus:not(:focus-visible)) {
    box-shadow: none;
    outline: none;
}
:focus {
    outline: none;
}
#scroll-container {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--list-color-back, #ffffff);
}
slot {
    display: block;
    width: 100%;
}
::slotted([value]) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 2rem;
    padding: 5px 5px 5px 35px;
    white-space: normal;
    color: var(--list-color-front, #000000);
    background-color: var(--list-color-back, #ffffff);
    border-bottom: solid 1px #eee;
    font-size: 1rem;
}
::slotted([value][disabled]) {
    display: none;
}
::slotted([value]:hover),
::slotted([value].marked) {
    background-color: var(--input-button-color, #cccccc);
}
::slotted([value])::before {
    position: absolute;
    left: 0;
    margin: 0px 10px 0px 9px;
    font-size: 1.2rem;
    line-height: 1em;
    content: "☐";
}
::slotted([value].active)::before {
    content: "☑";
}
:host(:not([readonly])) ::slotted([value]:not(.active)),
:host([readonly="false"]) ::slotted([value]:not(.active)),
:host([multiple]:not([multiple="false"]):not([readonly])) ::slotted([value].active),
:host([readonly="false"][multiple]:not([multiple="false"])) ::slotted([value].active) {
    cursor: pointer;
}
#header {
    padding-right: 2px;
    padding-left: 2px;
}
#empty {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
    min-height: 2rem;
    padding: 5px;
    margin: 5px 2px;
    white-space: normal;
}
`);

export default class ListSelect extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("container").addEventListener("slotchange", event => {
            const all = this.querySelectorAll(`[value]`);
            all.forEach(el => {
                if (el) {
                    el.onclick = () => {
                        this./*#*/__choose(el.getAttribute("value"));
                    };
                }
            });
            this.calculateItems();
        });
        /* header */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("check", event => {
            if (this.multiple) {
                const all = this.querySelectorAll(`[value]`);
                const value = [];
                if (event.value) {
                    all.forEach(el => {
                        if (!!el && el.style.display == "" || el.classList.contains("active")) {
                            value.push(el.value);
                        }
                    });
                } else {
                    all.forEach(el => {
                        if (!!el && el.style.display == "none" && el.classList.contains("active")) {
                            value.push(el.value);
                        }
                    });
                }
                this.value = value;
            }
        });
        headerEl.addEventListener("search", event => {
            const all = this.querySelectorAll(`[value]`);
            let checked = false;
            let unchecked = false;
            if (event.value) {
                const regEx = new SearchAnd(event.value);
                if (this.style.height == "") {
                    this.style.height = `${this.getBoundingClientRect().height}px`;
                }
                all.forEach(el => {
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
                });
            } else {
                all.forEach(el => {
                    el.style.display = "";
                    if (el.classList.contains("active")) {
                        checked = true;
                    } else {
                        unchecked = true;
                    }
                });
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
        this.addEventListener("blur", event => {
            this./*#*/__cancelSelection();
            event.stopPropagation();
            return false;
        });
        const scrollContainer = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("keyup", event => {
            if (!this.readonly) {
                if (event.key == "Escape") {
                    this./*#*/__cancelSelection();
                    event.stopPropagation();
                    return false;
                } else if (event.key == "Enter") {
                    const marked = this.querySelector(".marked");
                    if (marked != null) {
                        this./*#*/__choose(marked.getAttribute("value"));
                    }
                    event.stopPropagation();
                    return false;
                } else if (event.key == "ArrowUp") {
                    const marked = this.querySelector(".marked");
                    if (marked != null) {
                        let el = marked.previousElementSibling;
                        while (el != null && el.style.display == "none") {
                            el = el.previousElementSibling;
                        }
                        if (el != null) {
                            marked.classList.remove("marked");
                            el.classList.add("marked");
                            const targetScroll = el.offsetTop - 20;
                            if (scrollContainer.scrollTop > targetScroll) {
                                scrollContainer.scrollTop = targetScroll;
                            }
                        }
                    } else {
                        let el = this.querySelector("[value]");
                        while (el != null && el.style.display == "none") {
                            el = el.nextElementSibling;
                        }
                        if (el != null) {
                            el.classList.add("marked");
                            scrollContainer.scrollTop = 0;
                        }
                    }
                    event.stopPropagation();
                    return false;
                } else if (event.key == "ArrowDown") {
                    const marked = this.querySelector(".marked");
                    if (marked != null) {
                        let el = marked.nextElementSibling;
                        while (el != null && el.style.display == "none") {
                            el = el.nextElementSibling;
                        }
                        if (el != null) {
                            marked.classList.remove("marked");
                            el.classList.add("marked");
                            const targetScroll = el.offsetTop - scrollContainer.clientHeight + el.clientHeight + 20;
                            if (scrollContainer.scrollTop < targetScroll) {
                                scrollContainer.scrollTop = targetScroll;
                            }
                        }
                    } else {
                        let el = this.querySelector("[value]");
                        while (el != null && el.style.display == "none") {
                            el = el.nextElementSibling;
                        }
                        if (el != null) {
                            el.classList.add("marked");
                            scrollContainer.scrollTop = 0;
                        }
                    }
                    event.stopPropagation();
                    return false;
                }
            }
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
        if (!this.value && !!all.length) {
            this.value = all[0].value;
        }
        all.forEach(el => {
            if (el) {
                el.onclick = () => {
                    this./*#*/__choose(el.getAttribute("value"));
                };
            }
        });
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
            } else {
                if (Array.isArray(val)) {
                    val = val[0];
                }
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
            all.forEach(el => {
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
            });
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
            all.forEach(el => {
                if (el) {
                    if (this.value == el.value) {
                        el.classList.add("active");
                    } else {
                        el.classList.remove("active");
                    }
                }
            });
        }
    }

    /*#*/__cancelSelection() {
        const marked = this.querySelector(".marked");
        if (marked != null) {
            marked.classList.remove("marked");
        }
    }

    /*#*/__choose(value) {
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
