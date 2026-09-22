import {
    describe, it
} from "node:test";
import assert from "assert";
import SetView from "../../../src/data/view/SetView.js";

describe("SetView", () => {
    const set = new Set();
    set.add("foobar");
    set.add("barfoo");
    set.add("foo");
    set.add("bar");
    const setView = new SetView(set);

    describe("add()", () => {
        it("should throw error", () => {
            assert.throws(() => {
                setView.add(1);
            }, new TypeError("setView.add is not a function"));
        });
    });

    describe("has()", () => {
        it("should return true if the key exists", () => {
            assert.equal(setView.has("foobar"), true);
        });
        it("should return false if the key does not exist", () => {
            assert.equal(setView.has(1), false);
        });
    });
});
