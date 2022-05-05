import FileLoader from "../../util/FileLoader.js";
import FileResource from "../FileResource.js";

export default class JSONCResource extends FileResource {

    constructor(src) {
        if (src == null) {
            throw new Error("resource must have a path associated with it");
        }
        super(src, FileLoader.jsonc(src));
    }

}
