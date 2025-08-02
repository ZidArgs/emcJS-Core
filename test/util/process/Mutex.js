import {
    describe, it, before
} from "node:test";
import assert from "assert";
import Mutex from "../../../src/util/process/Mutex.js";
import {sleep} from "../../../src/util/process/Sleep.js";

const PREFIXES = ["A", "B", "C", "D", "E", "F"];
const ITERATIONS = 10;

const EXPECTATION = [];

for (const prefix of PREFIXES) {
    for (let i = 0; i < ITERATIONS; ++i) {
        EXPECTATION.push(`${prefix}${i}`);
    }
}

const mutex = new Mutex();

async function runLoop(result, prefix) {
    await mutex.acquire();
    for (let i = 0; i < ITERATIONS; ++i) {
        addToResult(result, prefix, i);
        await sleep();
    }
    mutex.release();
}

async function addToResult(result, prefix, counter) {
    result.push(`${prefix}${counter}`);
    await sleep();
}

describe("Mutex", () => {
    describe("apply mutex to run functions sequentially", () => {
        const result = [];
        before(async () => {
            const promises = [];

            for (const prefix of PREFIXES) {
                promises.push(runLoop(result, prefix));
            }

            await Promise.all(promises);
        });
        it("ran through all in order", () => {
            // console.log("\n    result:\n    " + result.join(",").replace(/([A-F][0-9](?:,[A-F][0-9]){9}),/g, "$1\n    ") + "\n");
            assert.deepStrictEqual(result, EXPECTATION);
        });
    });
});
