import FileLoader from "../../util/FileLoader.js";
import FileResource from "../abstract/FileResource.js";
import {
    buildResourceProxy
} from "../util/ResourceProxy.js";

const EMPTY_DATA = buildResourceProxy({});

export default class XMLResource extends FileResource {

    #data = EMPTY_DATA;

    constructor(src) {
        super(src);
        // ---
        FileLoader.xml(src).then(data => {
            const proxyData = buildResourceProxy(data);
            this.#data = proxyData;
            const ev = new Event("load");
            ev.data = proxyData;
            this.dispatchEvent(ev);
        }).catch(err => {
            console.warn(err);
            const ev = new Event("error");
            this.dispatchEvent(ev);
        });
    }

    get(path) {
        if (typeof path == "string" && !!path) {
            return this.#data[path];
        } else {
            return this.#data;
        }
    }

}
