import {
    describe, it, mock
} from "node:test";
import assert from "assert";
import Logger from "../../../src/util/log/Logger.js";

globalThis.HTMLTextAreaElement = class HTMLTextAreaElement {};
globalThis.HTMLElement = class HTMLElement {};

const TIME_FND = /(....)-(..)-(..)T(..:..:..\....)Z/;
const TIME_REP = "$1-$2-$3 $4";

Logger.addLevel("CUSTOM");

describe("Logger", () => {
    it("should print message", () => {
        const log = mock.method(console, "log");
        const time = new Date;
        const timeString = time.toJSON().replace(TIME_FND, TIME_REP);
        Logger.message("CUSTOM", "this is a test message", "test", {time});
        assert.strictEqual(log.mock.callCount(), 1);
        const call = log.mock.calls[0];
        // TODO assert each arguments by itself so the message can be tested without exposing the time
        assert.deepStrictEqual(call.arguments, [
            "%c%s%c",
            "color:#B8B8B8",
            `[${timeString} - CUSTOM] test • this is a test message`,
            ""
        ]);
        mock.reset();
    });
    it("should print log message", () => {
        const log = mock.method(console, "log");
        const time = new Date;
        const timeString = time.toJSON().replace(TIME_FND, TIME_REP);
        Logger.log("this is a test message", "test", {time});
        assert.strictEqual(log.mock.callCount(), 1);
        const call = log.mock.calls[0];
        // TODO assert each arguments by itself so the message can be tested without exposing the time
        assert.deepStrictEqual(call.arguments, [
            "%c%s%c",
            "color:#83EB9E",
            `[${timeString} - LOG  ] test • this is a test message`,
            ""
        ]);
        mock.reset();
    });
    it("should print info message", () => {
        const log = mock.method(console, "log");
        const time = new Date;
        const timeString = time.toJSON().replace(TIME_FND, TIME_REP);
        Logger.info("this is a test message", "test", {time});
        assert.strictEqual(log.mock.callCount(), 1);
        const call = log.mock.calls[0];
        // TODO assert each arguments by itself so the message can be tested without exposing the time
        assert.deepStrictEqual(call.arguments, [
            "%c%s%c",
            "color:#84CFE6",
            `[${timeString} - INFO ] test • this is a test message`,
            ""
        ]);
        mock.reset();
    });
    it("should print warning message", () => {
        const log = mock.method(console, "log");
        const time = new Date;
        const timeString = time.toJSON().replace(TIME_FND, TIME_REP);
        Logger.warn("this is a test message", "test", {time});
        assert.strictEqual(log.mock.callCount(), 1);
        const call = log.mock.calls[0];
        // TODO assert each arguments by itself so the message can be tested without exposing the time
        assert.deepStrictEqual(call.arguments, [
            "%c%s%c",
            "color:#F5D753",
            `[${timeString} - WARN ] test • this is a test message`,
            ""
        ]);
        mock.reset();
    });
    it("should print error message", () => {
        const log = mock.method(console, "log");
        const time = new Date;
        const timeString = time.toJSON().replace(TIME_FND, TIME_REP);
        Logger.error("this is a test message", "test", {time});
        assert.strictEqual(log.mock.callCount(), 1);
        const call = log.mock.calls[0];
        // TODO assert each arguments by itself so the message can be tested without exposing the time
        assert.deepStrictEqual(call.arguments, [
            "%c%s%c",
            "color:#F59476",
            `[${timeString} - ERROR] test • this is a test message`,
            ""
        ]);
        mock.reset();
    });
    // TODO check for message logging with `new Error("this is a test message")`
});
