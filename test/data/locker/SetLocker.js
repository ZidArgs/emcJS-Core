import assert from "assert";
import SetLocker from "../../../src/data/locker/SetLocker.js";

describe("SetLocker", function() {
    const set = new Set();
    set.add("foobar");
    set.add("barfoo");
    set.add("foo");
    set.add("bar");
    const setLocker = new SetLocker(set);

    describe("add()", function() {
        it("should throw error", function() {
            assert.throws(() => {
                setLocker.add(1);
            }, "TypeError: setLocker.add is not a function");
        });
    });

    describe("has()", function() {
        it("should return true if the key exists", function() {
            assert.equal(setLocker.has("foobar"), true);
        });
        it("should return false if the key does not exist", function() {
            assert.equal(setLocker.has(1), false);
        });
    });
});
