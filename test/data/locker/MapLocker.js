import assert from "assert";
import MapLocker from "../../../src/data/locker/MapLocker.js";

describe("MapLocker", function() {
    const map = new Map();
    map.set("foobar", "barfoo");
    map.set("barfoo", "foobar");
    map.set("foo", "bar");
    map.set("bar", "foo");
    const mapLocker = new MapLocker(map);

    describe("set()", function() {
        it("should throw error", function() {
            assert.throws(() => {
                mapLocker.set(1, 2);
            }, "TypeError: mapLocker.set is not a function");
        });
    });

    describe("has()", function() {
        it("should return true if the key exists", function() {
            assert.equal(mapLocker.has("foobar"), true);
        });
        it("should return false if the key does not exist", function() {
            assert.equal(mapLocker.has(1), false);
        });
    });
});
