async function sendRequest(url, config) {
    const r = await fetch(url, config);
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error on ${config.method} for url "${url}" - status: ${r.status}`);
    }
    return r;
}

class Request {

    async get(url) {
        return await sendRequest(url, {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }
        });
    }

    async post(url, body) {
        return await sendRequest(url, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify(body)
        });
    }

}

export default new Request;
