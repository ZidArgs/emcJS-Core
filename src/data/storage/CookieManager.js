/**
 * @typedef CookieData
 * @type {Object}
 * @property {string} name
 * @property {string | void} value
 * @property {string | void} domain
 * @property {number | void} expires
 * @property {boolean | void} partitioned
 * @property {string | void} path
 * @property {"strict" | "lax" | "none" | void} sameSite
 * @property {boolean | void} secure
 */

/**
 * @typedef SetCookieOptions
 * @type {Object}
 * @property {string} name
 * @property {string} value
 * @property {string | void} domain
 * @property {number | void} expires
 * @property {number | void} maxAge
 * @property {boolean | void} partitioned
 * @property {string | void} path
 * @property {"strict" | "lax" | "none" | void} sameSite
 */

/**
 * @typedef GetCookieOptions
 * @type {Object}
 * @property {string} name
 * @property {string} url
 */

/**
 * @typedef DeleteCookieOptions
 * @type {Object}
 * @property {string} name
 * @property {string | void} domain
 * @property {string | void} path
 * @property {boolean | void} partitioned
 */

/**
 * CookieManager provides methods for getting and setting cookies asynchronously.
 *
 * This builds upon CookieStore functionality.
 */
class CookieManager extends EventTarget {

    constructor() {
        super();
        cookieStore.addEventListener("change", (event) => {
            const ev = new Event("change");
            ev.changed = event.changed;
            ev.deleted = event.deleted;
            this.dispatchEvent(ev);
        });
    }

    /**
     * Sets a cookie with the given name and value or options object.
     *
     * @param {string | SetCookieOptions} name the name of the cookie or the {@link SetCookieOptions}
     * @param {string} value the value to be set (ignored if {@link SetCookieOptions} is used)
     */
    async set(name, value) {
        await cookieStore.set(name, value);
    }

    /**
     * Returns a Promise that resolves to a single cookie matching the given name or options object.
     *
     * The method will return the first cookie that matches.
     *
     * @param {string | GetCookieOptions} name the name of the cookie or the {@link GetCookieOptions}
     * @returns {Promise<CookieData | null>} the first matching {@link CookieData} or `null`
     */
    async get(name) {
        return await cookieStore.get(name);
    }

    /**
     * Returns a Promise that resolves as an array of cookies that match the name or options passed to it.
     *
     * Passing no parameters will return all cookies for the current context.
     *
     * @param {string | GetCookieOptions} name the name of the cookie or the {@link GetCookieOptions}
     * @returns {Promise<CookieData[]>} an `Array` with all matching {@link CookieData}
     */
    async getAll(name) {
        return await cookieStore.getAll(name);
    }

    /**
     * Deletes a cookie that matches the given name or options object.
     *
     * The method expires the cookie by changing its date to one in the past.
     *
     * @param {string | DeleteCookieOptions} name the name of the cookie or the {@link DeleteCookieOptions}
     */
    async delete(name) {
        await cookieStore.delete(name);
    }

    /**
     * Returns a Promise that resolves to the value of a single cookie matching the given name or options object.
     *
     * The method will return the first cookie that matches.
     *
     * @param {string | GetCookieOptions} name the name of the cookie or the {@link GetCookieOptions}
     * @returns {Promise<string | null>} the first matching cookie value or `null`
     */
    async getValue(name) {
        const data = await this.get(name);
        if (data) {
            return data.value;
        }
    }

    /**
     * Returns a Promise that resolves as an object of name-value-pairs of the cookies that match the name or options passed to it.
     *
     * Passing no parameters will return all cookies for the current context.
     *
     * If names are not unique, only the first value will be used.
     *
     * @param {string | GetCookieOptions} name the name of the cookie or the {@link GetCookieOptions}
     * @returns {Promise<Object.<string, string>>} an object with all name, value pairs
     */
    async getAllValues(name) {
        const data = await this.getAll(name);
        if (data.length) {
            const result = {};
            for (const entry of data) {
                if (entry.name in result) {
                    continue;
                }
                result[entry.name] = entry.value;
            }
            return result;
        }
        return {};
    }

}

export default new CookieManager();
