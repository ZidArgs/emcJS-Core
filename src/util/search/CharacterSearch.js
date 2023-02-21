function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class CharacterSearch {

    constructor(query = "") {
        if (typeof query != "string") {
            throw new TypeError(`query parameter must be of type "string" but was "${typeof query}"`);
        }
        query = escapeRegExp(query).split("");
        return new RegExp(`${query.join(".*")}`, "i");
    }

}
