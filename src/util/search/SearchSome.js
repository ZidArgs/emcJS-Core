import {escapeRegExp} from "../helper/RegExp.js";

/**
 * A Regular Expression that matches if at least one token is present
 * in the searched string.
 */
export default class SearchSome extends RegExp {

    /**
     * Create a Regular Expression that matches if at least one token is present
     * in the searched string.
     *
     * @param {String} query a space seperated list of search tokens
     */
    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query).split(" ");
        super(`(${query.join("|")})`, "i");
    }

}
