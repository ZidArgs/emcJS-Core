import CustomElementDelegating from "../element/CustomElementDelegating.js";
import SearchAnd from "../../util/search/SearchAnd.js";
import "./Option.js";
import "../symbols/ChevronDownSymbol.js";
import TPL from "./SearchSelect.js.html" assert {type: "html"};
import STYLE from "./SearchSelect.js.css" assert {type: "css"};

export default class SearchSelect extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("container").addEventListener("slotchange", () => {
            const all = this.querySelectorAll(`[value]`);
            all.forEach((el) => {
                if (el) {
                    el.onclick = (event) => {
                        this.#choose(event.currentTarget.getAttribute("value"));
                        event.stopPropagation();
                        return false;
                    };
                    if (el.value == this.value) {
                        this.shadowRoot.getElementById("view").value = el.innerHTML;
                    }
                }
            });
        });
        const viewEl = this.shadowRoot.getElementById("view");
        const inputEl = this.shadowRoot.getElementById("input");
        const containerEl = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("click", (event) => {
            if (!this.readonly) {
                viewEl.setAttribute("mode", "edit");
                inputEl.focus();
            }
            event.stopPropagation();
            return false;
        });
        const scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.addEventListener("keyup", (event) => {
            if (!this.readonly) {
                if (viewEl.getAttribute("mode") == "view") {
                    if (event.key == "Enter") {
                        viewEl.setAttribute("mode", "edit");
                        inputEl.focus();
                        event.stopPropagation();
                        return false;
                    }
                } else if (event.key == "Escape") {
                    this.#cancelSelection();
                    event.stopPropagation();
                    return false;
                } else if (event.key == "Enter") {
                    const marked = this.querySelector(".marked");
                    if (marked != null) {
                        this.#choose(marked.getAttribute("value"));
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
                            if (scrollContainerEl.scrollTop > targetScroll) {
                                scrollContainerEl.scrollTop = targetScroll;
                            }
                        }
                    } else {
                        let el = this.querySelector("[value]");
                        while (el != null && el.style.display == "none") {
                            el = el.nextElementSibling;
                        }
                        if (el != null) {
                            el.classList.add("marked");
                            scrollContainerEl.scrollTop = 0;
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
                            const targetScroll = el.offsetTop - scrollContainerEl.clientHeight + el.clientHeight + 20;
                            if (scrollContainerEl.scrollTop < targetScroll) {
                                scrollContainerEl.scrollTop = targetScroll;
                            }
                        }
                    } else {
                        let el = this.querySelector("[value]");
                        while (el != null && el.style.display == "none") {
                            el = el.nextElementSibling;
                        }
                        if (el != null) {
                            el.classList.add("marked");
                            scrollContainerEl.scrollTop = 0;
                        }
                    }
                    event.stopPropagation();
                    return false;
                }
            }
        });
        inputEl.addEventListener("focus", () => {
            if (!this.readonly) {
                inputEl.value = "";
                const thisRect = this.getBoundingClientRect();
                containerEl.style.display = "block";
                containerEl.style.left = `${thisRect.left}px`;
                containerEl.style.width = `${thisRect.width}px`;
                const containerRect = containerEl.getBoundingClientRect();
                if (thisRect.bottom + containerRect.height > window.innerHeight - 25) {
                    containerEl.style.bottom = `${window.innerHeight - thisRect.top}px`;
                } else {
                    containerEl.style.top = `${thisRect.bottom}px`;
                }
            }
        });
        window.addEventListener("wheel", () => {
            if (viewEl.getAttribute("mode") != "view") {
                this.#cancelSelection();
            }
        }, {passive: true});
        window.addEventListener("mousedown", (event) => {
            if (viewEl.getAttribute("mode") != "view") {
                this.#cancelSelection();
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        containerEl.addEventListener("wheel", (event) => {
            event.stopPropagation();
            return false;
        }, {passive: true});
        this.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            return false;
        });
        this.addEventListener("blur", (event) => {
            this.#cancelSelection();
            event.stopPropagation();
            return false;
        });
        inputEl.addEventListener("input", () => {
            const all = this.querySelectorAll(`[value]`);
            const regEx = new SearchAnd(inputEl.value);
            all.forEach((el) => {
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
        all.forEach((el) => {
            if (el) {
                el.onclick = (event) => {
                    this.#choose(event.currentTarget.getAttribute("value"));
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
                    this.#applyValue(this.value);
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

    #cancelSelection() {
        const container = this.shadowRoot.getElementById("scroll-container");
        const view = this.shadowRoot.getElementById("view");
        if (container.style.display != "") {
            const input = this.shadowRoot.getElementById("input");
            input.value = "";
            this.#applyValue(this.value);
            container.style.display = "";
            container.style.bottom = "";
            container.style.top = "";
            const all = this.querySelectorAll(`[value]`);
            all.forEach((el) => {
                el.style.display = "";
            });
            const marked = this.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        }
        view.setAttribute("mode", "view");
    }

    #choose(value) {
        const view = this.shadowRoot.getElementById("view");
        if (!this.readonly) {
            this.value = value;
            const container = this.shadowRoot.getElementById("scroll-container");
            container.style.display = "";
            container.style.bottom = "";
            container.style.top = "";
            const all = this.querySelectorAll(`[value]`);
            all.forEach((el) => {
                el.style.display = "";
            });
            const marked = this.querySelector(".marked");
            if (marked != null) {
                marked.classList.remove("marked");
            }
        }
        view.setAttribute("mode", "view");
        view.focus();
    }

    #applyValue(value) {
        const view = this.shadowRoot.getElementById("view");
        const el = this.querySelector(`[value="${value}"]`);
        if (el != null) {
            view.innerHTML = el.innerHTML;
        } else {
            view.innerHTML = value;
        }
    }

}

customElements.define("emc-searchselect", SearchSelect);
