import {
    describe, it
} from "node:test";
import assert from "assert";
import MapLocker from "../../../src/data/locker/MapLocker.js";

describe("MapLocker", () => {
    const map = new Map();
    map.set("foobar", "barfoo");
    map.set("barfoo", "foobar");
    map.set("foo", "bar");
    map.set("bar", "foo");
    const mapLocker = new MapLocker(map);

    describe("set()", () => {
        it("should throw error", () => {
            assert.throws(() => {
                mapLocker.set(1, 2);
            }, "TypeError: mapLocker.set is not a function");
        });
    });

    describe("has()", () => {
        it("should return true if the key exists", () => {
            assert.equal(mapLocker.has("foobar"), true);
        });
        it("should return false if the key does not exist", () => {
            assert.equal(mapLocker.has(1), false);
        });
    });
});
