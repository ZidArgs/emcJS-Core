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

function extractModule(obj) {
    return obj.default;
}

class Import {

    async module(url) {
        if (Array.isArray(url)) {
            const res = [];
            for (const i of url) {
                res.push(import(i).then(extractModule)
                    .catch(err=>{throw new Error(`Error appending module "${i}" ${err}`)}));
            }
            return await Promise.all(res);
        } else {
            return await import(url).then(extractModule)
                .catch(err=>{throw new Error(`Error appending module "${url}" ${err}`)});
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
    
    addStyle(url) {
        return new Promise((res, rej) => {
            const t = document.createElement("link");
            t.rel = "stylesheet";
            t.type = "text/css";
            t.onload = function() {
                res(t);
            };
            t.onerror = function() {
                getFile(url).then(function() {
                    rej(`error appending style "${url}"`);
                }, function(r) {
                    rej(r);
                })
            };
            t.href = url;
            document.head.append(t);
        });
    }
    
    addScript(url) {
        return new Promise((res, rej) => {
            const t = document.createElement("script");
            t.type = "text/javascript";
            t.onload = function() {
                res(t);
            };
            t.onerror = function() {
                getFile(url).then(function() {
                    rej(`error appending script "${url}"`);
                }, function(r) {
                    rej(r);
                })
            };
            t.src = url;
            document.head.append(t);
        });
    }
    
    addModule(url) {
        return new Promise((res, rej) => {
            const t = document.createElement("script");
            t.type = "module";
            t.onload = function() {
                res(t);
            };
            t.onerror = function() {
                getFile(url).then(function() {
                    rej(`error appending module "${url}"`);
                }, function(r) {
                    rej(r);
                })
            };
            t.src = url;
            document.head.append(t);
        });
    }

}

export default new Import();
