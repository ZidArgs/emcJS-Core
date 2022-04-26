import FileLoader from "../../util/FileLoader.js";
import FileResource from "../abstract/FileResource.js";

export default class TextResource extends FileResource {

    #data = "";

    constructor(src) {
        super(src);
        // ---
        FileLoader.text(src).then(data => {
            this.#data = data;
            const ev = new Event("load");
            ev.data = data;
            this.dispatchEvent(ev);
        }).catch(err => {
            console.warn(err);
            this.#data = "";
            const ev = new Event("error");
            this.dispatchEvent(ev);
        });
    }

    get() {
        return this.#data;
    }

}
