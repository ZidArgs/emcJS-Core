import {escapeRegExp} from "../helper/RegExp.js";

/**
 * A Regular Expression that matches if all characters are present in
 * the searched string in exactly the same order as in the query.
 */
export default class CharacterSearch extends RegExp {

    /**
     * Create a Regular Expression that matches if all characters are present in
     * the searched string in exactly the same order as in the query.
     *
     * @param {String} query a character sequence
     */
    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query).split("");
        super(`${query.join(".*")}`, "i");
    }

}
