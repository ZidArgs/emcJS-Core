import {
    describe, it
} from "node:test";
import assert from "assert";
import {deepFreeze} from "../../src/util/DeepFreeze.js";

describe("DeepFreeze", () => {
    const target = {
        a: true,
        b: {
            a: true,
            b: [0, 1]
        },
        c: new Map()
    };
    const frozenTarget = deepFreeze(target);

    describe("set value", () => {
        it("should throw error", () => {
            assert.throws(() => {
                target.a = false;
            }, new TypeError("Cannot assign to read only property 'a' of object '#<Object>'"));
        });
        it("should throw error - deep", () => {
            assert.throws(() => {
                target.b.a = false;
            }, new TypeError("Cannot assign to read only property 'a' of object '#<Object>'"));
        });
        it("should throw error - deep array", () => {
            assert.throws(() => {
                target.b.b[0] = 2;
            }, new TypeError("Cannot assign to read only property '0' of object '[object Array]'"));
        });
        it("should not throw error - deep map", () => {
            assert.doesNotThrow(() => {
                target.c.set("a", "b");
            }, TypeError);
        });
    });

    describe("get value", () => {
        it("should return true", () => {
            assert.equal(frozenTarget.a, true);
        });
        it("should return true - deep", () => {
            assert.equal(frozenTarget.b.a, true);
        });
    });
});
