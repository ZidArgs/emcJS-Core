const PARSER = new DOMParser();

async function getFile(url) {
    const r = await fetch(url);
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${url}" - status: ${r.status}`);
    }
    return r;
}

function parseHTML(input) {
    const dom = PARSER.parseFromString(input, "text/html");
    return dom.body.childNodes;
}

function extractText(input) {
    return input.text();
}

function constructStyle(rules) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(rules);
    return styleSheet;
}

function getHTML(url) {
    return getFile(url)
        .then(extractText)
        .then(parseHTML);
}

function getCSS(url) {
    return getFile(url)
        .then(extractText)
        .then(constructStyle);
}

function extractModule(module) {
    try {
        const {
            default: def, ...other
        } = module ?? {};
        return [def, other];
    } catch (err) {
        throw new Error(`Error extracting module`, {cause: err});
    }
}

async function importModule(url) {
    return import(url)
        .then(extractModule)
        .catch((err) => {
            throw new Error(`Error loading module "${url}"`, {cause: err});
        });
}

class Import {

    async module(url) {
        if (Array.isArray(url)) {
            const res = [];
            for (const i of url) {
                res.push(importModule(i));
            }
            return await Promise.all(res);
        } else {
            return await importModule(url);
        }
    }

    async html(url) {
        if (Array.isArray(url)) {
            const res = [];
            for (const i in url) {
                res.push(getHTML(i));
            }
            return await Promise.all(res);
        } else {
            return await getHTML(url);
        }
    }

    async css(url) {
        if (Array.isArray(url)) {
            const res = [];
            for (const i in url) {
                res.push(getCSS(i));
            }
            return await Promise.all(res);
        } else {
            return await getCSS(url);
        }
    }

}

export default new Import();
