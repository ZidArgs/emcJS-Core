import HTTPMethods from "../../enum/http/HTTPMethods.js";
import {
    isNull,
    isStringNotEmpty
} from "../helper/CheckType.js";

export default class FileUploader {

    #method = HTTPMethods.POST;

    #path = "/upload";

    constructor(options) {
        const {
            path,
            method
        } = options ?? {};
        if (!isNull(path)) {
            if (!isStringNotEmpty(path)) {
                throw new TypeError("path needs to be a non empty string or null");
            }
            this.#path = path;
        }
        if (!isNull(path)) {
            if (!HTTPMethods.includes(method)) {
                throw new TypeError("method needs to be a value of HTTPMethods or null");
            }
            this.#method = method;
        }
    }

    async upload(files) {
        if (!Array.isArray(files)) {
            files = [files];
        }
        const formData = new FormData();
        for (const file of files) {
            if (!(file instanceof File)) {
                throw new TypeError("at least one item is not a File");
            }
            formData.append("file[]", file);
        }
        const r = await fetch(this.#path, {
            method: this.#method.toString(),
            body: formData
        });
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error uploading files - status: ${r.status}`);
        }
        return r;
    }

    async uploadRaw(file) {
        if (!(file instanceof File)) {
            throw new TypeError("file has to be a File");
        }
        const r = await fetch(this.#path, {
            method: this.#method.toString(),
            body: file,
            headers: {
                "Content-Type": file.type,
                "Content-Disposition": `attachment; filename="${file.name}"`
            }
        });
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error uploading files - status: ${r.status}`);
        }
        return r;
    }

}
