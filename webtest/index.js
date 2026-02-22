import FileLoader from "/emcJS/util/file/FileLoader.js";
import "/emcJS/ui/form/button/LinkButton.js";

const config = await FileLoader.json("./index.json");

const listEl = document.getElementById("list");
const pageLinkEl = document.getElementById("page-link");
const viewContainerEl = document.getElementById("view-container");

const SRC_PREFIX = "/pages/";
const SRC_SUFFIX = "/index.html";
const NAME_PREFIX = "page=";
const VIEW_MAP = new Map();
const LINK_MAP = new Map();

listEl.style.width = innerWidth * 0.2;

if (location.hash == "") {
    location.hash = "home";
}

document.getElementById("menu").addEventListener("click", () => {
    document.body.classList.remove("view");
    document.body.classList.add("menu");
});

document.getElementById("back").addEventListener("click", () => {
    document.body.classList.remove("menu");
    document.body.classList.add("view");
});

window.addEventListener("hashchange", (event) => {
    document.body.classList.remove("menu");
    document.body.classList.add("view");
    const url = new URL(event.newURL);
    const hash = url.hash.slice(1);
    switchView(hash);
}, false);

function scrollIntoViewIfNeeded(target) {
    if (target.getBoundingClientRect().bottom > target.parentElement.clientHeight) {
        target.scrollIntoView(false);
    }
    if (target.getBoundingClientRect().top < 0) {
        target.scrollIntoView();
    }
}

function switchView(hashName) {
    if (!hashName.startsWith(NAME_PREFIX)) {
        hashName = "home";
    }

    const activeEls = viewContainerEl.querySelectorAll(".active");
    for (const el of activeEls) {
        el.classList.remove("active");
    }
    const targetEls = document.body.querySelectorAll(".target");
    for (const el of targetEls) {
        el.classList.remove("target");
    }
    const nextEl = VIEW_MAP.get(hashName);
    if (nextEl != null) {
        nextEl.classList.add("active");
    }
    const entryEl = document.getElementById(hashName);
    if (entryEl != null) {
        scrollIntoViewIfNeeded(entryEl);
        entryEl.classList.add("target");
    }

    pageLinkEl.href = LINK_MAP.get(hashName) ?? "/home/index.html";
}

function addEntry(containerEl, src, {
    label, children
}, hashPrefix = "") {
    if (hashPrefix) {
        hashPrefix = hashPrefix + "::";
    }
    const preSrc = `${SRC_PREFIX}${src}${SRC_SUFFIX}`;
    const preName = `${hashPrefix}${label.replace(/ /g, "_")}`;
    const hashName = `${NAME_PREFIX}${preName}`;
    const entryEl = document.createElement("div");
    const urlHash = `#${hashName}`;

    const linkEl = document.createElement("a");
    linkEl.href = `/${urlHash}`;
    linkEl.innerHTML = label;
    linkEl.id = hashName;
    entryEl.append(linkEl);

    if (children != null) {
        for (const [ref, data] of Object.entries(children)) {
            addEntry(entryEl, `${src}/${ref}`, data, preName);
        }
    }

    containerEl.append(entryEl);

    // add reference
    const frameEl = addPage(preSrc);
    LINK_MAP.set(hashName, preSrc);
    VIEW_MAP.set(hashName, frameEl);
}

function addPage(src) {
    const frameEl = document.createElement("object");
    frameEl.addEventListener("load", () => {
        // load default theme
        const defaultThemeLink = document.createElement("link");
        defaultThemeLink.href = "/emcJS/_style/index.css";
        defaultThemeLink.rel = "stylesheet";
        defaultThemeLink.type = "text/css";
        frameEl.contentDocument.head.appendChild(defaultThemeLink);
        // load override theme
        const overrideThemeLink = document.createElement("link");
        overrideThemeLink.href = "/theme.css";
        overrideThemeLink.rel = "stylesheet";
        overrideThemeLink.type = "text/css";
        frameEl.contentDocument.head.appendChild(overrideThemeLink);
    }, {once: true});
    frameEl.setAttribute("type", "text/html");
    frameEl.data = src;
    viewContainerEl.append(frameEl);
    return frameEl;
}

{
    const frameEl = addPage("/home/index.html");
    VIEW_MAP.set("home", frameEl);

    for (const [ref, data] of Object.entries(config)) {
        addEntry(listEl, ref, data);
    }

    switchView(location.hash.slice(1));
}

