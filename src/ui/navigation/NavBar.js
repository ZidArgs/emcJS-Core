import CustomElement from "../element/CustomElement.js";
import "./components/Button.js";
import "./components/HamburgerButton.js";
import TPL from "./NavBar.html" assert {type: "html"};
import STYLE from "./NavBar.css" assert {type: "css"};

const MIXINS = new Map();

export default class NavBar extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */

        // layout
        const container = this.shadowRoot.getElementById("container");
        const cover = this.shadowRoot.getElementById("cover");
        const content = this.shadowRoot.getElementById("content");
        const hamburger = this.shadowRoot.getElementById("hamburger-button");
        hamburger.addEventListener("click", () => {
            if (container.classList.contains("open")) {
                container.classList.remove("open");
                container.classList.remove("cover");
                content.querySelectorAll(".open").forEach(function(el) {
                    el.classList.remove("open");
                });
                content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                    el.expand = "closed";
                });
                hamburger.open = false;
            } else {
                container.classList.add("open");
                hamburger.open = true;
            }
        });
        cover.addEventListener("click", () => {
            container.classList.remove("open");
            container.classList.remove("cover");
            content.querySelectorAll(".open").forEach(function(el) {
                el.classList.remove("open");
            });
            content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                el.expand = "closed";
            });
            hamburger.open = false;
        });
    }

    loadNavigation(config) {
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.innerHTML = "";
        for (const item of config) {
            this.#generateElement(contentEl, item);
        }
    }

    #generateElement(contentEl, config) {
        const containerEl = this.shadowRoot.getElementById("container");
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
                if (config["handler"] != null && typeof config.handler == "function") {
                    btnEl.addEventListener("click", (event) => {
                        const hamburger = this.shadowRoot.getElementById("hamburger-button");
                        hamburger.open = false;
                        containerEl.classList.remove("cover");
                        containerEl.classList.remove("open");
                        contentEl.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                            el.expand = "closed";
                        });
                        contentEl.querySelectorAll(".open").forEach(function(el) {
                            el.classList.remove("open");
                        });
                        config.handler();
                        event.stopPropagation();
                        return false;
                    });
                }
                // submenu events
                if (!IS_MAIN_NAV) {
                    btnEl.addEventListener("blur", (event) => {
                        if (!contentEl.contains(event.relatedTarget)) {
                            const pListEl = contentEl.parentElement;
                            const pBtnEl = pListEl.children[0];
                            pBtnEl.expand = "closed";
                            pListEl.classList.remove("open");
                            containerEl.classList.remove("cover");
                            event.preventDefault();
                        }
                    });
                    btnEl.addEventListener("focus", (event) => {
                        if (!contentEl.contains(event.relatedTarget)) {
                            const pListEl = contentEl.parentElement;
                            const pBtnEl = pListEl.children[0];
                            pBtnEl.expand = "open";
                            pListEl.classList.add("open");
                            containerEl.classList.add("cover");
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
                    btnEl.addEventListener("click", (event) => {
                        if (btnEl.expand == "open") {
                            btnEl.expand = "closed";
                            if (IS_MAIN_NAV) {
                                listEl.classList.remove("open");
                                containerEl.classList.remove("cover");
                            }
                        } else {
                            if (IS_MAIN_NAV) {
                                contentEl.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                                    el.expand = "closed";
                                });
                                contentEl.querySelectorAll(".open").forEach(function(el) {
                                    el.classList.remove("open");
                                });
                                listEl.classList.add("open");
                                containerEl.classList.add("cover");
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
