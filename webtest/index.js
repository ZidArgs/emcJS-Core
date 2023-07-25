import FileLoader from "/emcJS/util/file/FileLoader.js";

const config = await FileLoader.json("./index.json");

const listEl = document.getElementById("list");
const viewEl = document.getElementById("view");

const SRC_PREFIX = "/pages/";
const SRC_SUFFIX = "/index.html";
const NAME_PREFIX = "page=";
const VIEW_MAP = new Map();

let targetLinkEl = null;

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

viewEl.addEventListener("load", () => {
    // load default theme
    const defaultThemeLink = document.createElement("link");
    defaultThemeLink.href = "/emcJS/_style/theme.css";
    defaultThemeLink.rel = "stylesheet";
    defaultThemeLink.type = "text/css";
    viewEl.contentDocument.head.appendChild(defaultThemeLink);
    // load override theme
    const overrideThemeLink = document.createElement("link");
    overrideThemeLink.href = "/theme.css";
    overrideThemeLink.rel = "stylesheet";
    overrideThemeLink.type = "text/css";
    viewEl.contentDocument.head.appendChild(overrideThemeLink);
});

window.addEventListener("hashchange", (event) => {
    document.body.classList.remove("menu");
    document.body.classList.add("view");
    const url = new URL(event.newURL);
    const hash = url.hash.slice(1);
    if (hash.startsWith(NAME_PREFIX)) {
        viewEl.contentWindow.location.replace(VIEW_MAP.get(hash));
        const entryEl = document.getElementById(hash);
        scrollIntoViewIfNeeded(entryEl);
    } else {
        viewEl.contentWindow.location.replace("/home/index.html");
        const entryEl = document.getElementById("home");
        scrollIntoViewIfNeeded(entryEl);
    }
    // ---
    if (targetLinkEl != null) {
        targetLinkEl.classList.remove("target");
    }
    targetLinkEl = document.getElementById(hash);
    if (targetLinkEl != null) {
        targetLinkEl.classList.add("target");
    }
}, false);

function scrollIntoViewIfNeeded(target) {
    if (target.getBoundingClientRect().bottom > target.parentElement.clientHeight) {
        target.scrollIntoView(false);
    }
    if (target.getBoundingClientRect().top < 0) {
        target.scrollIntoView();
    }
}

function addEntry(targetEl, src, {label, children}, hashPrefix = "") {
    if (hashPrefix) {
        hashPrefix = hashPrefix + "::"
    }
    const preSrc = `${SRC_PREFIX}${src}${SRC_SUFFIX}`;
    const preName = `${hashPrefix}${label.replace(/ /g, "_")}`;
    const hashID = `${NAME_PREFIX}${preName}`;
    const entryEl = document.createElement("div");
    const hashName = `#${hashID}`;

    const linkEl = document.createElement("a");
    linkEl.href = `/${hashName}`;
    linkEl.innerHTML = label;
    linkEl.id = hashID;
    entryEl.append(linkEl);

    if (children != null) {
        for (const [ref, data] of Object.entries(children)) {
            addEntry(entryEl, `${src}/${ref}`, data, preName);
        }
    }

    targetEl.append(entryEl);

    // add reference
    VIEW_MAP.set(hashID, preSrc);
    if (location.hash == hashName) {
        viewEl.src = preSrc;
        entryEl.focus();
        scrollIntoViewIfNeeded(entryEl);
        targetLinkEl = linkEl;
        linkEl.classList.add("target");
    }
}

for (const [ref, data] of Object.entries(config)) {
    addEntry(listEl, ref, data);
}
