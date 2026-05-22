import {
    describe, it
} from "node:test";
import assert from "assert";
import {deepClone} from "../../../src/util/helper/DeepClone.js";

const SET = new Set([
    1,
    2,
    3,
    4
]);
const SOURCE = {
    a: "test",
    b: 42,
    c: new Date(),
    [Symbol("test")]: SET,
    [Symbol("test2")]: SET
};

describe("DeepClone", () => {
    describe("copy object", () => {
        const clone = deepClone(SOURCE);

        it("clone is identical", () => {
            // console.log("mutation 0", mutations.changes);
            assert.deepStrictEqual(clone, SOURCE);
        });
    });
});
