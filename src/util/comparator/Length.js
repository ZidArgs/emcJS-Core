import {isNumberNotNaN} from "../helper/CheckType.js";

/**
 * Compares two objects by their length property (ascending).
 *
 * @param {Object} a the object to compare
 * @param {Object} b the object to compare with
 * @returns {Number} whether the compared Object `a` is shorter (negative), longer (positive) or if they are equal (0)
 */
export function compareLengthAsc(a, b) {
    if (!isNumberNotNaN(a.length)) {
        throw new TypeError("a.length has to be a valid number");
    }
    if (!isNumberNotNaN(b.length)) {
        throw new TypeError("b.length has to be a valid number");
    }
    return a.length - b.length;
}

/**
 * Compares two objects by their length property (descending).
 *
 * @param {Object} a the object to compare
 * @param {Object} b the object to compare with
 * @returns {Number} whether the compared Object `a` is longer (negative), shorter (positive) or if they are equal (0)
 */
export function compareLengthDesc(a, b) {
    if (!isNumberNotNaN(a.length)) {
        throw new TypeError("a.length has to be a valid number");
    }
    if (!isNumberNotNaN(b.length)) {
        throw new TypeError("b.length has to be a valid number");
    }
    return b.length - a.length;
}
