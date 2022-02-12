import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomElement from "../CustomElement.js";
import "./Button.js";
import "./HamburgerButton.js";

const TPL = new Template(`
<div id="container">
    <div id="cover">
    </div>
    <ul id="content">
    </ul>
</div>
<emc-navbar-hamburger id="hamburger-button">
</emc-navbar-hamburger>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    justify-content: space-between;
    top: 0;
    width: 100%;
    min-height: 40px;
    background-color: var(--navigation-background-color, #ffffff);
    color: var(--navigation-text-color, #000000);
    flex-grow: 0;
    flex-shrink: 0;
    z-index: 900700;
}
#container {
    display: block;
    margin: 0;
    z-index: 100;
}
#cover {
    position: fixed;
    display: none;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
}
#container.cover #cover,
#container.open #cover {
    display: block;
}
#hamburger-button {
    position: relative;
    display: none;
    width: 40px;
    height: 40px;
    margin: 4px;
    transition: transform 0.2s ease-in-out;
}
#container.open ~ #hamburger-button {
    transform: translateX(calc(100vw - 50px));
}
ul {
    position: relative;
    -webkit-padding-start: 0;
    -webkit-margin-before: 0;
    -webkit-margin-after: 0;
    -moz-padding-start: 0;
    -moz-margin-before: 0;
    -moz-margin-after: 0;
    list-style: none;
}
ul li {
    position: relative;
    min-width: 150px;
    padding: 5px;
    background-color: var(--navigation-background-color, #ffffff);
}
ul > li {
    display: inline-block;
}
ul > li > ul {
    left: 0;
    width: 100px;
    z-index: 100;
}
ul#content {
    display: inline-flex;
    margin: 0;
}
ul li > emc-navbar-button {
    height: 26px;
    width: 100%;
}
@media (max-width: 500px) {
    :host {
        display: block;
        width: 100vw;
    }
    #container {
        position: absolute;
        width: 100vw;
        left: -100vw;
        height: 100vh;
        padding-right: 50px;
        transition: left 0.2s ease-in-out;
    }
    #container.open {
        left: 0;
    }
    #hamburger-button {
        display: inline-block;
        z-index: 100;
    }
    ul li {
        width: 100%;
    }
    ul#content {
        flex-direction: column;
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
    }
    ul#content > li > ul {
        display: none;
        width: 100%;
        padding: 0 0 0 20px;
    }
    ul#content > li.open > ul {
        display: table;
    }
    ul#content > li > ul:not(:last-child) {
        padding-bottom: 4px;
    }
    emc-navbar-button {
        height: 40px;
        --justify-content: flex-start;
    }
}
@media (min-width: 501px) {
    ul#content {
        flex-wrap: wrap;
        width: 100%;
        padding: 2px 10px;
    }
    ul#content > li > ul {
        position: absolute;
        display: table;
        top: 100%;
        transition: transform 0.2s ease-in-out;
        transform-origin: center top;
        transform: scaleY(0);
    }
    ul#content > li.open > ul {
        transform: scaleY(1);
    }
    ul#content > li > ul > li {
        display: inline-block;
        width: 100%;
    }
}
`);

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
