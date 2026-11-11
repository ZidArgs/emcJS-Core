import JSONMutatorComposer from "./JSONMutatorComposer.js";
import {patchJSONReviver} from "./patch/JSONReviverPatch.js";

export function stringifyJSON(value, replacer, space) {
    const composer = new JSONMutatorComposer(replacer);
    return JSON.stringify(value, composer.mutator, space);
}

export function parseJSON(text, reviver) {
    const composer = new JSONMutatorComposer(patchJSONReviver);
    composer.add(reviver);
    return JSON.parse(text, composer.mutator);
}

export function safeParseJSON(value, reviver) {
    if (typeof value !== "string" || value === "") {
        return null;
    }
    try {
        return parseJSON(value, reviver);
    } catch {
        return null;
    }
}
