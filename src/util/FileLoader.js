import JSONC from "./converter/JSONC.js";
import XML from "./converter/XML.js";
import INI from "./converter/INI.js";
import Properties from "./converter/Properties.js";

async function getFile(file, contentType) {
    const r = await fetch(new Request(file, {
        method: 'GET',
        headers: new Headers({
            "Content-Type": contentType,
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }),
        mode: 'cors',
        cache: 'default'
    }));
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${file}" - status: ${r.status}`);
    }
    return r;
}

function getText(input) {
    return input.text();
}

function getJSON(input) {
    return input.json();
}

class FileLoader {

    text(file) {
        return getFile(file, "text/plain").then(getText);
    }

    json(file) {
        return getFile(file, "application/json").then(getJSON);
    }

    jsonc(file) {
        return this.text(file).then(JSONC.parse);
    }

    xml(file) {
        return this.text(file).then(XML.parse);
    }

    ini(file) {
        return this.text(file).then(INI.parse);
    }

    properties(file) {
        return this.text(file).then(Properties.parse);
    }

}

export default new FileLoader;
