import {
    describe, it
} from "node:test";
import assert from "assert";
import SetLocker from "../../../src/data/locker/SetLocker.js";

describe("SetLocker", () => {
    const set = new Set();
    set.add("foobar");
    set.add("barfoo");
    set.add("foo");
    set.add("bar");
    const setLocker = new SetLocker(set);

    describe("add()", () => {
        it("should throw error", () => {
            assert.throws(() => {
                setLocker.add(1);
            }, "TypeError: setLocker.add is not a function");
        });
    });

    describe("has()", () => {
        it("should return true if the key exists", () => {
            assert.equal(setLocker.has("foobar"), true);
        });
        it("should return false if the key does not exist", () => {
            assert.equal(setLocker.has(1), false);
        });
    });
});
