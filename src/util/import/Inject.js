async function getFile(url) {
    const r = await fetch(url);
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${url}" - status: ${r.status}`);
    }
    return r;
}

class Inject {

    css(url) {
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

    script(url) {
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

    module(url) {
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

export default new Inject();
