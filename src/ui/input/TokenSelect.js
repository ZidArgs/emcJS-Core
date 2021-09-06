import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import ElementManager from "../../util/html/ElementManager.js";
import "../../i18n/ui/form/InputElement.js";
import "../../i18n/ui/I18nLabel.js";
import "../../i18n/ui/I18nTooltip.js";
import "./Option.js";
import "../symbols/ChevronDownSymbol.js";

const TPL = new Template(`
<div id="view" mode="view" tabindex="0"></div>
<input id="input" is="emc-i18n-input" i18n-value="search..." autocomplete="off">
<emc-i18n-tooltip i18n-tooltip="Reset search">
    <div id="search-reset" class="button">
        <emc-symbol-clear></emc-symbol-clear>
    </div>
</emc-i18n-tooltip>
<div class="button">
    <emc-symbol-chevron-down></emc-symbol-chevron-down>
</div>
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
    flex-direction: row;
    align-items: center;
    min-width: 200px;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border: solid 1px var(--input-border-color, #000000);
    border-radius: 2px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
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
.button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--list-color-front, #000000);
    background-color: transparent;
    font-size: 1.5rem;
    cursor: pointer;
}
#view,
#input {
    flex: 1;
    padding: 0px 7px;
    font-size: inherit;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border: none;
    font-size: 1rem;
}
#input {
    height: 2rem;
}
#input::placeholder {
    font-style: italic;
}
#view {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}
#view:empty:after {
    content: "...";
}
#view[mode="edit"] {
    display: none;
}
#view[mode="view"] + #input {
    display: none;
}
#view:empty + #search-reset {
    display: none;
}
#scroll-container {
    position: fixed;
    display: none;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--input-back-color, #ffffff);
    border: solid 1px var(--input-border-color, #000000);
    z-index: 1000;
    box-shadow: black 2px 2px 2px;
}
slot {
    display: block;
    width: 100%;
}
::slotted([value]) {
    display: flex;
    align-items: center;
    min-height: 2rem;
    padding: 5px 5px 5px 35px;
    white-space: normal;
    color: var(--input-text-color, #000000);
    background-color: var(--input-back-color, #ffffff);
    border-bottom: solid 1px var(--input-button-color, #cccccc);
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
.token {
    display: inline-block;
    padding: 0px 5px;
    margin-right: 5px;
    color: var(--input-back-color, #ffffff);
    background-color: var(--input-text-color, #000000);
    border-radius: 4px;
}
`);

const EL_MANAGER = new WeakMap();
const ON_CLICK = new WeakMap();

function onOptionClick(event) {
    const el = event.currentTarget;
    if (!this.readonly) {
        const valueBuffer = new Set(this.value);
        const value = el.getAttribute("value");
        if (valueBuffer.has(value)) {
            valueBuffer.delete(value);
            this.value = Array.from(valueBuffer);
            this./*#*/__applyValue(this.value);
        }
    }
    event.stopPropagation();
    return false;
}

function composer(key, params) {
    const el = document.createElement("div");
    el.className = "token";
    const label = document.createElement("emc-i18n-label");
    label.i18nValue = key;
    el.setAttribute("value", params.value);
    el.addEventListener("click", params.onClick);
    el.append(label);
    return el;
}

export default class TokenSelect extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open", delegatesFocus: true});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        ON_CLICK.set(this, onOptionClick.bind(this));
        const searchResetEl = this.shadowRoot.getElementById("search-reset");
        searchResetEl.addEventListener("click", ev => {
            this.value = [];
            this./*#*/__applyValue([]);
        });
        /* --- */
        this.shadowRoot.getElementById("container").addEventListener("slotchange", event => {
            const all = this.querySelectorAll(`[value]`);
            all.forEach(el => {
                if (el) {
                    el.onclick = event => {
                        this./*#*/__choose(event.currentTarget.getAttribute("value"));
                        event.stopPropagation();
                        return false;
                    };
                    this./*#*/__applyValue(this.value);
                }
            });
        });
        const view = this.shadowRoot.getElementById("view");
        const input = this.shadowRoot.getElementById("input");
        const container = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("click", event => {
            if (!this.readonly) {
                view.setAttribute("mode", "edit");
                input.focus();
            }
            event.stopPropagation();
            return false;
        });
        const scrollContainer = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("keyup", event => {
            if (!this.readonly) {
                if (view.getAttribute("mode") == "view") {
                    if (event.key == "Enter") {
                        view.setAttribute("mode", "edit");
                        input.focus();
                        event.stopPropagation();
                        return false;
                    }
                } else {
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
            }
        });
        input.addEventListener("focus", event => {
            if (!this.readonly) {
                input.value = "";
                const thisRect = this.getBoundingClientRect();
                container.style.display = "block";
                container.style.left = `${thisRect.left}px`;
                container.style.width = `${thisRect.width}px`;
                const containerRect = container.getBoundingClientRect();
                if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
                    container.style.bottom = `${window.innerHeight - thisRect.top}px`;
                } else {
                    container.style.top = `${thisRect.bottom}px`;
                }
            }
        });
        window.addEventListener("wheel", event => {
            if (view.getAttribute("mode") != "view") {
                this./*#*/__cancelSelection();
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        window.addEventListener("mousedown", event => {
            if (view.getAttribute("mode") != "view") {
                this./*#*/__cancelSelection();
            }
        });
        container.addEventListener("wheel", event => {
            event.stopPropagation();
            return false;
        });
        this.addEventListener("mousedown", event => {
            event.stopPropagation();
            return false;
        });
        this.addEventListener("blur", event => {
            this./*#*/__cancelSelection();
            event.stopPropagation();
            return false;
        });
        input.addEventListener("input", event => {
            const all = this.querySelectorAll(`[value]`);
            const regEx = new SearchAnd(input.value);
            all.forEach(el => {
                if (el.innerText.trim().match(regEx)) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                    el.classList.remove("marked");
                }
            });
        }, true);
        /* --- */
        EL_MANAGER.set(this, new ElementManager(view, composer));
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        const all = this.querySelectorAll(`[value]`);
        all.forEach(el => {
            if (el) {
                el.onclick = event => {
                    this./*#*/__choose(event.currentTarget.getAttribute("value"));
                    event.stopPropagation();
                    return false;
                };
            }
        });
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
            if (!Array.isArray(val)) {
                val = [val];
            }
            val = JSON.stringify(val);
            this.setAttribute("value", val);
        } else {
            this.removeAttribute("value");
        }
    }

    get value() {
        let val = this.getAttribute("value");
        if (val != null) {
            val = JSON.parse(val);
        } else {
            val = [];
        }
        return val;
    }

    get readonly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["value", "readonly"];
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
            case "readonly":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("view").readonly = newValue;
                    if (newValue != null && newValue != "false") {
                        this.shadowRoot.getElementById("view").disabled = true;
                    } else {
                        this.shadowRoot.getElementById("view").disabled = false;
                    }
                }
                break;
        }
    }
    
    calculateItems() {
        const all = this.querySelectorAll(`[value]`);
        const vals = new Set(this.value);
        all.forEach(el => {
            if (el) {
                if (vals.has(el.value)) {
                    el.classList.add("active");
                } else {
                    el.classList.remove("active");
                }
            }
        });
    }

    /*#*/__cancelSelection() {
        const container = this.shadowRoot.getElementById("scroll-container");
        const view = this.shadowRoot.getElementById("view");
        if (container.style.display != "") {
            const input = this.shadowRoot.getElementById("input");
            input.value = "";
            this./*#*/__applyValue(this.value);
            container.style.display = "";
            container.style.bottom = "";
            container.style.top = "";
            const all = this.querySelectorAll(`[value]`);
            all.forEach(el => {
                el.style.display = "";
            });
            const marked = this.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        }
        view.setAttribute("mode", "view");
    }

    /*#*/__choose(value) {
        if (!this.readonly) {
            const valueBuffer = new Set(this.value);
            if (valueBuffer.has(value)) {
                valueBuffer.delete(value);
            } else {
                valueBuffer.add(value);
            }
            this.value = Array.from(valueBuffer);
        }
    }

    /*#*/__applyValue(value) {
        const elManager = EL_MANAGER.get(this);
        const onClick = ON_CLICK.get(this);
        const data = [];
        value.forEach((val) => {
            data.push({
                key: val,
                value: val,
                onClick
            });
        });
        elManager.manage(data);
    }

}

customElements.define("emc-tokenselect", TokenSelect);
