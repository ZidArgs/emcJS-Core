import CustomElement from "../element/CustomElement.js";
import EventManager from "../../util/event/EventManager.js";
import {
    isFunction,
    isHttpUrl
} from "../../util/helper/CheckType.js";
import "./button/NavbarButton.js";
import "./button/HamburgerButton.js";
import TPL from "./NavBar.js.html" assert {type: "html"};
import STYLE from "./NavBar.js.css" assert {type: "css"};

const MIXINS = new Map();

function closeAll(targetEl) {
    for (const el of targetEl.querySelectorAll(".open")) {
        el.classList.remove("open");
    }
    for (const el of targetEl.querySelectorAll("[expand=\"open\"]")) {
        el.expand = "closed";
        el.blur();
    }
}

function encodeWindowFeatures(input) {
    if (typeof input === "string") {
        return input;
    } else if (typeof input === "object" && !Array.isArray(input)) {
        return Object.entries(input).map((entry) => {
            const [key, value] = entry;
            return `${key}=${value}`;
        }).join(",");
    }
}

// TODO use EventManager for navigation elements
export default class NavBar extends CustomElement {

    #containerEl;

    #contentEl;

    #coverEl;

    #hamburgerEl;

    #navigationHandler = null;

    #navigationEventManager = new EventManager(false);

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */

        // layout
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#hamburgerEl = this.shadowRoot.getElementById("hamburger-button");
        this.#coverEl = this.shadowRoot.getElementById("cover");
        this.registerTargetEventHandler(this.#hamburgerEl, "click", () => {
            if (this.#containerEl.classList.contains("open")) {
                this.#containerEl.classList.remove("open");
                this.#containerEl.classList.remove("cover");
                closeAll(this.#contentEl);
                this.#hamburgerEl.open = false;
            } else {
                this.#containerEl.classList.add("open");
                this.#hamburgerEl.open = true;
            }
        });
        this.registerTargetEventHandler(this.#coverEl, "click", () => {
            this.#containerEl.classList.remove("open");
            this.#containerEl.classList.remove("cover");
            closeAll(this.#contentEl);
            this.#hamburgerEl.open = false;
        });
    }

    connectedCallback() {
        super.connectedCallback?.();
        this.#navigationEventManager.active = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        this.#navigationEventManager.active = false;
    }

    set maxWidth(value) {
        this.setIntAttribute("maxwidth", value, 0);
    }

    get maxWidth() {
        return this.getIntAttribute("maxwidth");
    }

    static get observedAttributes() {
        return ["maxwidth"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "maxwidth") {
            if (oldValue != newValue) {
                this.#containerEl.style.maxWidth = `${newValue}px`;
            }
        }
    }

    loadNavigation(config) {
        this.#navigationEventManager.clear();
        this.#contentEl.innerHTML = "";
        for (const item of config) {
            this.#generateElement(this.#contentEl, item);
        }
    }

    setNavigationHandler(fn) {
        if (typeof fn === "function") {
            this.#navigationHandler = fn;
        } else {
            this.#navigationHandler = null;
        }
    }

    #generateElement(contentEl, config) {
        const IS_MAIN_NAV = contentEl.id == "content";
        if (config["visible"] == null || !!config["visible"]) {
            if (config["mixin"]) {
                const mixinConfig = MIXINS.get(config["mixin"]);
                if (mixinConfig != null) {
                    for (const item of mixinConfig) {
                        this.#generateElement(contentEl, item);
                    }
                }
            } else {
                const listEl = document.createElement("li");
                const btnEl = document.createElement("emc-navbar-button");
                listEl.append(btnEl);
                // content
                if (config["content"] != null) {
                    btnEl.content = config["content"];
                }
                if (config["tooltip"] != null) {
                    btnEl.tooltip = config["tooltip"];
                }
                // action
                if (isFunction(config.handler)) {
                    this.#navigationEventManager.set(btnEl, "click", (event) => {
                        this.#hamburgerEl.open = false;
                        this.#containerEl.classList.remove("cover");
                        this.#containerEl.classList.remove("open");
                        closeAll(contentEl);
                        config.handler();
                        event.stopPropagation();
                        return false;
                    });
                }
                // href
                if (isHttpUrl(config.href)) {
                    this.#navigationEventManager.set(btnEl, "click", (event) => {
                        this.#hamburgerEl.open = false;
                        this.#containerEl.classList.remove("cover");
                        this.#containerEl.classList.remove("open");
                        closeAll(contentEl);
                        const target = event.ctrlKey ? "_blank" : config.target;
                        if (target) {
                            const windowFeatures = encodeWindowFeatures(config.windowFeatures);
                            window.open(config.href, target, windowFeatures);
                        } else if (this.#navigationHandler != null) {
                            this.#navigationHandler(config.href);
                        } else {
                            window.location.href = config.href;
                        }
                        event.stopPropagation();
                        return false;
                    });
                }
                // submenu events
                if (!IS_MAIN_NAV) {
                    this.#navigationEventManager.set(btnEl, "blur", (event) => {
                        if (event.relatedTarget == null || !contentEl.contains(event.relatedTarget)) {
                            const pListEl = contentEl.parentElement;
                            const pBtnEl = pListEl.children[0];
                            pBtnEl.expand = "closed";
                            pListEl.classList.remove("open");
                            this.#containerEl.classList.remove("cover");
                            event.preventDefault();
                        }
                    });
                    this.#navigationEventManager.set(btnEl, "focus", (event) => {
                        if (event.relatedTarget != null && !contentEl.contains(event.relatedTarget)) {
                            const pListEl = contentEl.parentElement;
                            const pBtnEl = pListEl.children[0];
                            pBtnEl.expand = "open";
                            pListEl.classList.add("open");
                            this.#containerEl.classList.add("cover");
                            event.preventDefault();
                        }
                    });
                }
                // submenu
                if (config["submenu"] != null) {
                    const subcontent = document.createElement("ul");
                    for (const item of config["submenu"]) {
                        this.#generateElement(subcontent, item);
                    }
                    listEl.append(subcontent);
                    // submenu button events
                    btnEl.expand = "closed";
                    this.#navigationEventManager.set(btnEl, "click", (event) => {
                        if (btnEl.expand == "open") {
                            btnEl.expand = "closed";
                            if (IS_MAIN_NAV) {
                                listEl.classList.remove("open");
                                this.#containerEl.classList.remove("cover");
                            }
                        } else {
                            if (IS_MAIN_NAV) {
                                closeAll(contentEl);
                                listEl.classList.add("open");
                                this.#containerEl.classList.add("cover");
                            }
                            btnEl.expand = "open";
                        }
                        event.stopPropagation();
                        return false;
                    });
                }
                // add element
                contentEl.append(listEl);
            }
        }
    }

    static addMixin(name, config) {
        MIXINS.set(name, config);
    }

}

customElements.define("emc-navbar", NavBar);
