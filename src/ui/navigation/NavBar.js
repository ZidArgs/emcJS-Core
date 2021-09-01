import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
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
:host * {
    box-sizing: border-box;
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

export default class NavBar extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const container = this.shadowRoot.getElementById("container");
        const cover = this.shadowRoot.getElementById("cover");
        const content = this.shadowRoot.getElementById("content");
        const hamburger = this.shadowRoot.getElementById("hamburger-button");
        hamburger.onclick = (event) => {
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
        };
        cover.onclick = (event) => {
            container.classList.remove("open");
            container.classList.remove("cover");
            content.querySelectorAll(".open").forEach(function(el) {
                el.classList.remove("open");
            });
            content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                el.expand = "closed";
            });
            hamburger.open = false;
        };
    }

    loadNavigation(config) {
        const content = this.shadowRoot.getElementById("content");
        content.innerHTML = "";
        for (const item of config) {
            if (item.visible == null || !!item.visible) {
                const el = document.createElement("li");
                const btn = document.createElement("emc-navbar-button");
                el.append(btn);
                // content
                if (item["i18n-content"] != null) {
                    btn.i18nContent = item["i18n-content"];
                }
                if (item["content"] != null) {
                    btn.content = item["content"];
                }
                // tooltip
                if (item["i18n-tooltip"] != null) {
                    btn.i18nTooltip = item["i18n-tooltip"];
                }
                if (item["tooltip"] != null) {
                    btn.tooltip = item["tooltip"];
                }
                // action
                if (item["handler"] != null && typeof item.handler == "function") {
                    btn.addEventListener("click", (event) => {
                        const hamburger = this.shadowRoot.getElementById("hamburger-button");
                        hamburger.open = false;
                        const container = this.shadowRoot.getElementById("container");
                        container.classList.remove("cover");
                        container.classList.remove("open");
                        content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                            el.expand = "closed";
                        });
                        content.querySelectorAll(".open").forEach(function(el) {
                            el.classList.remove("open");
                        });
                        item.handler();
                        event.stopPropagation();
                        return false;
                    });
                }
                // submenu
                if (item["submenu"] != null) {
                    const subcontent = document.createElement("ul");
                    for (const subitem of item.submenu) {
                        if (subitem.visible == null || !!subitem.visible) {
                            const subel = document.createElement("li");
                            const subbtn = document.createElement("emc-navbar-button");
                            subel.append(subbtn);
                            // content
                            if (subitem["i18n-content"] != null) {
                                subbtn.i18nContent = subitem["i18n-content"];
                            }
                            if (subitem["content"] != null) {
                                subbtn.content = subitem["content"];
                            }
                            // tooltip
                            if (subitem["i18n-tooltip"] != null) {
                                subbtn.i18nTooltip = subitem["i18n-tooltip"];
                            }
                            if (subitem["tooltip"] != null) {
                                subbtn.tooltip = subitem["tooltip"];
                            }
                            // action
                            if (subitem["handler"] != null && typeof subitem.handler == "function") {
                                subbtn.addEventListener("click", (event) => {
                                    const hamburger = this.shadowRoot.getElementById("hamburger-button");
                                    hamburger.open = false;
                                    const container = this.shadowRoot.getElementById("container");
                                    container.classList.remove("cover");
                                    container.classList.remove("open");
                                    content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                                        el.expand = "closed";
                                    });
                                    content.querySelectorAll(".open").forEach(function(el) {
                                        el.classList.remove("open");
                                    });
                                    subitem.handler();
                                    event.stopPropagation();
                                    return false;
                                });
                            }
                            subcontent.append(subel);
                        }
                    }
                    el.append(subcontent);
                    btn.expand = "closed";
                    btn.addEventListener("click", (event) => {
                        const container = this.shadowRoot.getElementById("container");
                        if (btn.expand == "open") {
                            btn.expand = "closed";
                            el.classList.remove("open");
                            container.classList.remove("cover");
                        } else {
                            content.querySelectorAll("[expand=\"open\"]").forEach(function(el) {
                                el.expand = "closed";
                            });
                            content.querySelectorAll(".open").forEach(function(el) {
                                el.classList.remove("open");
                            });
                            btn.expand = "open";
                            el.classList.add("open");
                            container.classList.add("cover");
                        }
                        event.stopPropagation();
                        return false;
                    });
                }
                content.append(el);
            }
        }
    }

}

customElements.define("emc-navbar", NavBar);
