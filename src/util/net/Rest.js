async function sendRequest(url, query, config) {
    url = new URL(url, self.location.origin);
    if (query != null) {
        if (typeof query == "object") {
            if (Array.isArray(query)) {
                for (const i of query) {
                    url.searchParams.append(i, "");
                }
            } else {
                for (const i in query) {
                    url.searchParams.append(i, query[i]);
                }
            }
        } else if (query != "") {
            url.searchParams.append(query, "");
        }
    }
    config.cache = "no-cache";
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] = "application/json; charset=utf-8";
    config.headers["Cache-Control"] = "no-cache";
    const response = await fetch(url, config);
    if (response.status < 200 || response.status >= 300) {
        throw new Error(`error providing data [${config.method}: ${url.href}] - status: ${response.status} - ${response.statusText}`);
    }
    if (response.headers.get("content-type").indexOf("application/json") >= 0) {
        let result = null;

        try {
            result = await response.json();
        } catch (err) {
            throw new Error(`error reading response [${config.method}: ${url.href}]`, {cause: err});
        }

        if (!result.success && result.error) {
            throw new Error(`error providing data [${config.method}: ${url.href}] - ${result.error}`);
        }

        return result;
    } else {
        try {
            return await response.text();
        } catch (err) {
            throw new Error(`error reading response [${config.method}: ${url.href}]`, {cause: err});
        }
    }
}

class Rest {

    async get(url, query = null) {
        return await sendRequest(url, query, {method: "GET"});
    }

    async post(url, data = {}, query = null) {
        if (typeof data == "object" && !Array.isArray(data)) {
            return await sendRequest(url, query, {
                method: "POST",
                body: JSON.stringify(data)
            });
        } else {
            throw new TypeError("data must be a JSON object");
        }
    }

    async put(url, data = {}, query = null) {
        if (typeof data == "object" && !Array.isArray(data)) {
            return await sendRequest(url, query, {
                method: "PUT",
                body: JSON.stringify(data)
            });
        } else {
            throw new TypeError("data must be a JSON object");
        }
    }

    async delete(url, query = null) {
        return await sendRequest(url, query, {method: "DELETE"});
    }

}

export default new Rest();
