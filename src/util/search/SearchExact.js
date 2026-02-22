import {escapeRegExp} from "../helper/RegExp.js";

/**
 * A Regular Expression that matches if query is exactly the searched string.
 */
export default class SearchExact extends RegExp {

    /**
     * Create a Regular Expression that matches if query is exactly the searched string.
     *
     * @param {String} query the search query
     */
    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query);
        super(`^${query}$`, "i");
    }

}
