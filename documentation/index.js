import FileLoader from "/emcJS/util/file/FileLoader.js";

const config = await FileLoader.json("./index.json");

const listEl = document.getElementById("list");
const viewEl = document.getElementById("view");

const SRC_PREFIX = "/docs/";
const SRC_SUFFIX = "/index.html";
const NAME_PREFIX = "page=";
const VIEW_MAP = new Map();

if (location.hash == "") {
    location.hash = "home";
}

window.addEventListener("hashchange", (event) => {
    const url = new URL(event.newURL);
    const hash = url.hash.slice(1);
    if (hash.startsWith(NAME_PREFIX)) {
        viewEl.contentWindow.location.replace(VIEW_MAP.get(hash));
        const entryEl = document.getElementById(hash);
        scrollIntoViewIfNeeded(entryEl);
    } else {
        viewEl.contentWindow.location.replace("home/index.html");
        const entryEl = document.getElementById("home");
        scrollIntoViewIfNeeded(entryEl);
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
    const preName = `${hashPrefix}${label.replace(" ", "_")}`;
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
    }
}

for (const [ref, data] of Object.entries(config)) {
    addEntry(listEl, ref, data);
}
