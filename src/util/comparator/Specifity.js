import {isNumberNotNaN} from "../helper/CheckType.js";

/**
 * Compares two objects by their specifity.
 * Specifity has to be an Array containing Numbers.
 *
 * @param {Object} a the object to compare
 * @param {Object} b the object to compare with
 * @returns {Number} whether the compared Object `a` is more specific (negative), less specific (positive) or if they are equal (0)
 */
export function compareSpecifity(a, b) {
    if (!Array.isArray(a.specifity)) {
        throw new TypeError("a.specifity has to be an Array");
    }
    if (!Array.isArray(b.specifity)) {
        throw new TypeError("b.specifity has to be an Array");
    }
    for (let i = 0; i < a.length; ++i) {
        const currA = a.specifity[i];
        if (!isNumberNotNaN(currA)) {
            return 1;
        }
        const currB = b.specifity[i];
        if (!isNumberNotNaN(currB)) {
            return -1;
        }
        if (currA === currB) {
            continue;
        }
        return currA - currB;
    }
    return 0;
}
