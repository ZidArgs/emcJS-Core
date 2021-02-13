import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import "./Option.js";

const TPL = new Template(`
<div id="view" mode="view" tabindex="0"></div>
<input id="input" placeholder="Search..." autocomplete="off"></input>
<div id="button"></div>
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
    min-width: 200px;
    color: solid var(--input-text-color, #000000);
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
#button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: transparent;
    cursor: pointer;
}
#button:after {
    display: block;
    width: 0px;
    height: 6px;
    box-sizing: border-box;
    border-top: solid var(--input-text-color, #000000) 6px;
    border-left: solid transparent 4px;
    border-bottom: solid transparent 0px;
    border-right: solid transparent 4px;
    transition: transform 0.2s ease-in-out;
    transform-origin: 3px 4px;
    content: "";
}
#view,
#input {
    flex: 1;
    height: 2rem;
    padding: 0px 7px;
    font-size: inherit;
    background-color: transparent;
    border: none;
    font-size: 1rem;
}
#view {
    display: flex;
    align-items: center;
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
#scroll-container {
    position: fixed;
    display: none;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--input-back-color, #ffffff);
    scrollbar-color: var(--input-color-hover, #999999) var(--input-button-color, #cccccc);
    border: solid 1px var(--input-border-color, #000000);
    z-index: 1000;
    box-shadow: black 2px 2px 2px;
}
#scroll-container::-webkit-scrollbar-track {
    background-color: var(--input-button-color, #cccccc);
}
#scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--input-color-hover, #999999);
}
slot {
    display: block;
    width: 100%;
}
::slotted([value]) {
    display: flex;
    align-items: center;
    min-height: 2rem;
    padding: 5px 10px;
    white-space: normal;
    color: solid var(--input-text-color, #000000);
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
`);

export default class SearchSelect extends HTMLElement {

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
                    el.onclick = event => {
                        this./*#*/__choose(event.currentTarget.getAttribute("value"));
                        event.stopPropagation();
                        return false;
                    };
                    if (el.value == this.value) {
                        this.shadowRoot.getElementById("view").value = el.innerHTML;
                    }
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
                    }
                } else {
                    if (event.key == "Escape") {
                        this./*#*/__cancelSelection();
                    } else if (event.key == "Enter") {
                        const marked = this.querySelector(".marked");
                        if (marked != null) {
                            this./*#*/__choose(marked.getAttribute("value"));
                        }
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
                    }
                }
            }
            event.stopPropagation();
            return false;
        });
        input.addEventListener("focus", event => {
            if (!this.readonly) {
                input.value = "";
                const thisRect = this.getBoundingClientRect();
                container.style.display = "block";
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
            this./*#*/__cancelSelection();
            event.stopPropagation();
            return false;
        });
        container.addEventListener("wheel", event => {
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
    }

    connectedCallback() {
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", 0);
        }
        const all = this.querySelectorAll(`[value]`);
        if (!this.value && !!all.length) {
            this.value = all[0].value;
        }
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

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
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
                    const el = this.querySelector(`[value="${newValue}"]`);
                    const view = this.shadowRoot.getElementById("view");
                    const input = this.shadowRoot.getElementById("input");
                    if (el != null) {
                        view.innerHTML = el.innerHTML;
                        input.value = el.innerText;
                    } else {
                        view.innerHTML = newValue;
                        input.innerHTML = newValue;
                    }
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

    /*#*/__cancelSelection() {
        const container = this.shadowRoot.getElementById("scroll-container");
        const view = this.shadowRoot.getElementById("view");
        const input = this.shadowRoot.getElementById("input");
        if (container.style.display != "") {
            const selected = this.querySelector(`[value="${this.value}"]`);
            if (selected != null) {
                view.innerHTML = selected.innerHTML;
                input.value = selected.innerText;
            } else {
                view.innerHTML = this.value;
                input.value = this.value;
            }
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
        const view = this.shadowRoot.getElementById("view");
        if (!this.readonly) {
            this.value = value;
            const container = this.shadowRoot.getElementById("scroll-container");
            container.style.display = "";
            container.style.bottom = "";
            container.style.top = "";
            const all = this.querySelectorAll(`[value]`);
            all.forEach(el => {
                el.style.display = "";
            });
            const marked = this.querySelector(".marked");
            marked.classList.remove("marked");
        }
        view.setAttribute("mode", "view");
        view.focus();
    }

}

customElements.define("emc-searchselect", SearchSelect);
