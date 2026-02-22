import {
    describe, it
} from "node:test";
import assert from "assert";
import ArraySet from "../../../../src/data/collection/ArraySet.js";
import {getArrayMutations} from "../../../../src/util/helper/collection/ArrayMutations.js";

const SOURCE = [
    1,
    2,
    3,
    4,
    5,
    6,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    9,
    18,
    19,
    20
];
const TARGET_0 = [
    6,
    1,
    3,
    4,
    8,
    2,
    7,
    9,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20
];
const TARGET_1 = [
    20,
    2,
    3,
    4,
    5,
    6,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    9,
    18,
    19,
    1
];
const TARGET_2 = [
    3,
    4,
    5,
    6,
    10,
    11,
    12,
    13,
    14,
    1,
    2,
    15,
    16,
    17,
    9,
    18,
    19,
    20
];
const TARGET_3 = [
    1,
    2,
    3,
    4,
    5,
    6,
    10,
    19,
    11,
    12,
    13,
    14,
    20,
    15,
    16,
    17,
    9,
    18
];
const TARGET_4 = [
    1,
    2,
    3,
    4,
    5,
    6,
    10,
    11,
    12,
    13,
    14,
    9,
    20,
    15,
    16,
    17,
    18,
    19
];
const TARGET_5 = [
    2,
    3,
    4,
    6,
    10,
    1,
    5,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    9,
    18,
    19,
    20
];

describe("ArrayMutations", () => {
    const source = new ArraySet(SOURCE);

    describe("move, delete and add values to/at various positions", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_0);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [0]", () => {
            // console.log("mutation 0", mutations.changes);
            assert.deepStrictEqual(res, TARGET_0);
        });
    });

    describe("switch first and last", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_1);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [1]", () => {
            // console.log("mutation 1", mutations.changes);
            assert.deepStrictEqual(res, TARGET_1);
        });
    });

    describe("move sequence to sequence", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_2);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [2]", () => {
            // console.log("mutation 2", mutations.changes);
            assert.deepStrictEqual(res, TARGET_2);
        });
    });

    describe("move sequence into split positions", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_3);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [3]", () => {
            // console.log("mutation 3", mutations.changes);
            assert.deepStrictEqual(res, TARGET_3);
        });
    });

    describe("move split values into sequence left", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_4);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [4]", () => {
            // console.log("mutation 4", mutations.changes);
            assert.deepStrictEqual(res, TARGET_4);
        });
    });

    describe("move split values into sequence right", () => {
        const mutations = getArrayMutations(SOURCE, TARGET_5);
        const mutated = new ArraySet(source);

        mutated.delete(...mutations.deleted);
        for (const {
            position, sequence
        } of mutations.changes) {
            mutated.insertAt(position, ...sequence);
        }

        const res = Array.from(mutated);

        it("could be restored from mutations [5]", () => {
            // console.log("mutation 5", mutations.changes);
            assert.deepStrictEqual(res, TARGET_5);
        });
    });
});
