import {
    isString,
    isStringNotEmpty
} from "../helper/CheckType.js";
import {instanceOfOne} from "../helper/Class.js";

const ACCEPTED_CONTENT_TYPES = [
    Blob,
    DataView,
    ArrayBuffer,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float16Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array
];

/**
 * A helper function to create a file handle from a single data source
 *
 * @param {BlobPart} content the strings/ArrayBuffer/TypedArray/DataView/Blob to put inside the file handle
 * @param {string} fileName a string representing the file name or the path to the file
 * @param {{type?: string, endings?: "transparent" | "native", lastModified?: number}?} opts the file handle options
 * @returns {File} the newly created file handle containing the provided content
 */
export function toFile(content, fileName, opts) {
    if (!isString(content) && !instanceOfOne(content, ...ACCEPTED_CONTENT_TYPES)) {
        throw new TypeError(`content has to be either a string or one of [${ACCEPTED_CONTENT_TYPES}]`);
    }
    if (!isStringNotEmpty(fileName)) {
        throw new TypeError("fileName has be a non empty string");
    }
    return new File([content], fileName, opts);
}
