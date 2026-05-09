export default class DataBuffer {

    #bufferedData = [];

    add(data) {
        this.#bufferedData.push(data);
    }

    next() {
        if (this.#bufferedData.length) {
            return this.#bufferedData.shift();
        }
    }

    each(callback) {
        while (this.#bufferedData.length) {
            callback(this.#bufferedData.shift());
        }
    }

}
