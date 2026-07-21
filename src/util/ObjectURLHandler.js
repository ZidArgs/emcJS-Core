export default class ObjectURLHandler {

    #url;

    setBlob(blob) {
        if (this.#url != null) {
            URL.revokeObjectURL(this.#url);
        }
        this.#url = URL.createObjectURL(blob);
        return this.#url;
    }

    get url() {
        return this.#url;
    }

}
