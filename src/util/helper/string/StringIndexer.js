const INDEX_DELIMITER = "--#";
const INDEX_DELIMITER_REGEX = new RegExp(`${INDEX_DELIMITER}[0-9]*$`);

export default class StringIndexer {

    #indices = new Map();

    apply(value) {
        const index = this.#indices.get(value) ?? 0;
        const result = `${value}${INDEX_DELIMITER}${index}`;
        this.#indices.set(value, index + 1);
        return result;
    }

    static deIndex(value) {
        return value.replace(INDEX_DELIMITER_REGEX, "");
    }

}
