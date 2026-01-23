import {escapeRegExp} from "../helper/RegExp.js";

export default class SearchEvery extends RegExp {

    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query).split(" ");
        super(`(?=${query.join(")(?=")}).*`, "i");
    }

}
