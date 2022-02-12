import FileLoader from "/src/util/FileLoader.js";

const config = await FileLoader.json("./index.json");

const listEl = document.getElementById("list");
const viewEl = document.getElementById("view");

const SRC_PREFIX = "/docs/";
const SRC_SUFFIX = "/index.html";
const NAME_PREFIX = "page=";
const ViEW_MAP = new Map();

if (location.hash == "") {
    location.hash = "home";
}

window.addEventListener("hashchange", (event) => {
    const url = new URL(event.newURL);
    const hash = url.hash.slice(1);
    if (hash.startsWith(NAME_PREFIX)) {
        viewEl.contentWindow.location.replace(ViEW_MAP.get(hash));
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

function addEntry(name, src) {
    const preSrc = `${SRC_PREFIX}${src}${SRC_SUFFIX}`;
    const preName = `${NAME_PREFIX}${name.replace(" ", "_")}`;
    const entryEl = document.createElement("a");
    const hashName = `#${preName}`;

    entryEl.href = `/${hashName}`;
    entryEl.innerHTML = name;
    entryEl.id = preName;

    listEl.append(entryEl);

    // add reference
    ViEW_MAP.set(preName, preSrc);
    if (location.hash == hashName) {
        viewEl.src = preSrc;
        entryEl.focus();
        scrollIntoViewIfNeeded(entryEl);
    }
}

for (const [ref, name] of Object.entries(config)) {
    addEntry(name, ref);
}
