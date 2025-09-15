
import DOSDateConverter from "/emcJS/util/date/DOSDateConverter.js";
import {
    bufferToStream, streamToBlob, readString
} from "../utils.js";

class Inflate {

    async createArchive(blobs = []) {
        const stream = new WritableStream();
        // TODO
    }

    async #deflateEntry(blob) {
        const compressionStream = new CompressionStream("deflate-raw");
        const stream = blob.stream();
        return stream.pipeThrough(compressionStream);
    }

}

export default new Inflate();
