import {isNumberNotNaN} from "../helper/CheckType.js";

/**
 * Compares two Bbjects by their specifity.
 * Specifity has to be an Array containing Numbers.
 *
 * @param {Object} a the object to compare
 * @param {Object} b the object to compare with
 * @returns {Number} whether the compared Object `a` is more specific (negative), less specific (positive) or if they are equal (0)
 */
export function compareSpecifity(a, b) {
    const specifityA = a.specifity;
    const specifityB = b.specifity;
    if (!Array.isArray(specifityA)) {
        throw new TypeError("a.specifity has to be an Array");
    }
    if (!Array.isArray(specifityB)) {
        throw new TypeError("b.specifity has to be an Array");
    }
    for (let i = 0; i < a.length; ++i) {
        const currA = specifityA[i];
        if (!isNumberNotNaN(currA)) {
            return 1;
        }
        const currB = specifityB[i];
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
