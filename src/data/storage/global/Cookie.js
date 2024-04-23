class Cookie {

    set(name, value, expire = 1) {
        const d = new Date();
        d.setTime(d.getTime() + (expire * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;`;
    }

    get(name) {
        const entries = document.cookie.split(";");
        for (const entry of entries) {
            const buf = entry.trim().split("=");
            const key = buf.shift().trim();
            if (key === name) {
                const value = decodeURI(buf.join("="));
                return value;
            }
        }
        return "";
    }

    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;`;
    }

}

export default new Cookie();
