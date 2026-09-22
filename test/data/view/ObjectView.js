import {
    describe, it
} from "node:test";
import assert from "assert";
import ObjectView from "../../../src/data/view/ObjectView.js";

describe("ObjectView", () => {
    const target = {
        a: true,
        b: {
            a: true,
            b: [0, 1]
        },
        c: new Map()
    };
    const objectView = new ObjectView(target);

    describe("set value", () => {
        it("should throw error", () => {
            assert.throws(() => {
                objectView.a = false;
            }, new TypeError("view can not write to object"));
        });
        it("should throw error - deep", () => {
            assert.throws(() => {
                objectView.b.a = false;
            }, new TypeError("view can not write to object"));
        });
        it("should throw error - deep array", () => {
            assert.throws(() => {
                objectView.b.b[0] = 2;
            }, new TypeError("view can not write to object"));
        });
        it("should not throw error - deep map", () => {
            assert.doesNotThrow(() => {
                objectView.c.set("a", "b");
            }, Error);
        });
    });

    describe("get value", () => {
        it("should return true", () => {
            assert.equal(objectView.a, true);
        });
        it("should return true - deep", () => {
            assert.equal(objectView.b.a, true);
        });
    });

    describe("mutate base object", () => {
        target.d = "foobar";
        it("should reflect changes", () => {
            assert.equal(objectView.d, "foobar");
        });
    });
});
