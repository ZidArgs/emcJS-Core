function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class SearchOr {

    constructor(query) {
        query = escapeRegExp(query).split(" ");
        return new RegExp(`(${query.join("|")})`, "i");
    }

}
