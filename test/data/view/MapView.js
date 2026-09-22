import {
    describe, it
} from "node:test";
import assert from "assert";
import MapView from "../../../src/data/view/MapView.js";

describe("MapView", () => {
    const map = new Map();
    map.set("foobar", "barfoo");
    map.set("barfoo", "foobar");
    map.set("foo", "bar");
    map.set("bar", "foo");
    const mapView = new MapView(map);

    describe("set()", () => {
        it("should throw error", () => {
            assert.throws(() => {
                mapView.set(1, 2);
            }, new TypeError("mapView.set is not a function"));
        });
    });

    describe("has()", () => {
        it("should return true if the key exists", () => {
            assert.equal(mapView.has("foobar"), true);
        });
        it("should return false if the key does not exist", () => {
            assert.equal(mapView.has(1), false);
        });
    });
});
