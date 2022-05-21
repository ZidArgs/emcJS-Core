import FileLoader from "../../util/file/FileLoader.js";
import FileResource from "../FileResource.js";

export default class JSONResource extends FileResource {

    constructor(src) {
        if (src == null) {
            throw new Error("resource must have a path associated with it");
        }
        super(src, FileLoader.json(src));
    }

}
