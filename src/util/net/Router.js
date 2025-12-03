const ROUTES = new Map();

function resolveParams(params) {
    if (params.length) {
        return Object.fromEntries(params.slice(1).split("&").map((v)=>v.split("=")));
    } else {
        return {};
    }
}

/* TODO

use the same method as used in here to resolve
add placeholders to resolve values in url
on duplicate placeholder present just replace the value

! if not all values are set, the url will NOT resolve

e.g.:

route: /foo/bar/${val1}/${val2}
url: /foo/bar/lorem/ipsum/2/100/test?lang=en

will resolve to...
{
    route: "/foo/bar",
    values: {
        val1: "lorem",
        val2: "ipsum"
    },
    params: [
        "2",
        "100",
        "test"
    ],
    query: {
        lang: "en"
    }
}

but
url: /foo/bar/lorem/ipsum/2
will not resolve and fallback to next best match

async function callreceiver(receivers, path, method, query, body) {
    path = path.replace(/(^\/|\/$)/g, "");
    let parts = path.split("/").map(p => decodeURI(p));
    let params = [];
    while (!!parts.length) {
        let uri = `/${parts.join("/")}`;
        if (receivers.has(uri)) {
            let receiver = receivers.get(uri);
            return await receiver(method, params, query, body);
        }
        params.unshift(parts.pop());
    }
    return {status: 404};
}

*/
function callRoute(loc) {
    const path = loc.pathname;
    for (const [uri, callback] of ROUTES) {
        const regEx = new RegExp(`^${uri}$`);
        if (regEx.test(path)) {
            callback(uri, resolveParams(loc.search));
        }
    }
}

class Router {

    // TODO add exact match flag
    add(uri, callback) {
        if (typeof uri !== "string") {
            throw new TypeError("typeof uri must be a string");
        }
        if (typeof callback !== "function") {
            throw new TypeError("typeof callback must be a function");
        }
        if (ROUTES.has(uri)) {
            throw new Error(`the uri ${uri} already exists`);
        }
        ROUTES.set(uri, callback);
    }

    remove(uri) {
        ROUTES.remove(uri);
    }

    clear(uri) {
        ROUTES.clear(uri);
    }

    navigate(uri) {
        const loc = new URL(uri, location);
        history.pushState(null, null, loc);
        callRoute(loc);
    }

    init() {
        callRoute(location);
    }

}

export default new Router();
