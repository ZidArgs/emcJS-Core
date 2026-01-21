import {
    loadForm, init
} from "../util/formLoader.js";

await init();
await loadForm(false);

const customIconButtonEl = document.getElementById("custom-icon");
const linkCustomIconButtonEl = document.getElementById("link-custom-icon");

const customIcon = document.createElement("div");
customIcon.className = "icon";
customIcon.style.borderRadius = "50%";
customIcon.style.backgroundColor = "blue";
customIconButtonEl.append(customIcon);

const linkCustomIcon = document.createElement("div");
linkCustomIcon.className = "icon";
linkCustomIcon.style.borderRadius = "50%";
linkCustomIcon.style.backgroundColor = "red";
linkCustomIconButtonEl.append(linkCustomIcon);
