import {
    describe, it
} from "node:test";
import assert from "assert";
import {immute} from "../../src/data/Immutable.js";

describe("Immutable", () => {
    const target = {
        a: true,
        b: {
            a: true,
            b: [0, 1]
        },
        c: new Map()
    };
    const immutableTarget = immute(target);

    describe("set value", () => {
        it("should throw error", () => {
            assert.throws(() => {
                immutableTarget.a = false;
            }, new Error("can not modify immutable object"));
        });
        it("should throw error - deep", () => {
            assert.throws(() => {
                immutableTarget.b.a = false;
            }, new Error("can not modify immutable object"));
        });
        it("should throw error - deep array", () => {
            assert.throws(() => {
                immutableTarget.b.b[0] = 2;
            }, new Error("can not modify immutable object"));
        });
        it("should not throw error - deep map", () => {
            assert.doesNotThrow(() => {
                immutableTarget.c.set("a", "b");
            }, Error);
        });
    });

    describe("get value", () => {
        it("should return true", () => {
            assert.equal(immutableTarget.a, true);
        });
        it("should return true - deep", () => {
            assert.equal(immutableTarget.b.a, true);
        });
    });

    describe("mutate base object", () => {
        target.d = "foobar";
        it("should not reflect changes", () => {
            assert.notEqual(immutableTarget.d, "foobar");
        });
    });
});
