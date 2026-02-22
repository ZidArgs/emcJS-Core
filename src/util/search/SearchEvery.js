import {escapeRegExp} from "../helper/RegExp.js";

/**
 * A Regular Expression that matches if all token are present in the
 * searched string.
 */
export default class SearchEvery extends RegExp {

    /**
     * Create a Regular Expression that matches if all token are present in the
     * searched string.
     *
     * @param {String} query a space seperated list of search tokens
     */
    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query).split(" ");
        super(`^(?=.*${query.join(")(?=.*")}).*$`, "i");
    }

}
