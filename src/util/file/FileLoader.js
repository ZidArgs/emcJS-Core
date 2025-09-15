import JSONC from "../converter/JSONC.js";
import XML from "../converter/XML.js";
import INI from "../converter/INI.js";
import CSV from "../converter/CSV.js";
import Lang from "../converter/Lang.js";
import Properties from "../converter/Properties.js";
import jsonParse from "../../patches/JSONParser.js";

async function getFile(file, contentType) {
    const r = await fetch(new Request(file, {
        method: "GET",
        headers: new Headers({
            "Content-Type": contentType,
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }),
        mode: "cors",
        cache: "default"
    }));
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${file}" - status: ${r.status}`);
    }
    return r;
}

class FileLoader {

    async ini(file) {
        const content = await this.text(file);
        return INI.parse(content);
    }

    async csv(file) {
        const content = await this.text(file);
        return CSV.parse(content);
    }

    async json(file) {
        const content = await this.text(file, "application/json");
        return jsonParse(content);
    }

    async jsonc(file) {
        const content = await this.text(file);
        return JSONC.parse(content);
    }

    async lang(file) {
        const content = await this.text(file);
        return Lang.parse(content);
    }

    async properties(file) {
        const content = await this.text(file);
        return Properties.parse(content);
    }

    async text(file, contentType = "text/plain") {
        const response = await getFile(file, contentType);
        return await response.text();
    }

    async xml(file) {
        const content = await this.text(file);
        return XML.parse(content);
    }

}

export default new FileLoader;
