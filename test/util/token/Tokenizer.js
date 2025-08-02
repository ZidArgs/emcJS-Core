import {
    describe, it
} from "node:test";
import assert from "assert";
import Tokenizer from "../../../src/util/token/Tokenizer.js";
import TokenStorage, {toTokenLiteral} from "../../../src/util/token/TokenStorage.js";

const tokenizer = new Tokenizer();

function functionParams(tokenStorage, term) {
    return term.split(",").map((el) => {
        const literal = tokenizer.process(el.trim(), tokenStorage);
        const idx = tokenStorage.add(literal);
        return toTokenLiteral(idx);
    }).join(", ");
}

// FUNCTIONS
tokenizer.rule(/([^()\s]+)\(([^()]+)\)/, (tokenStorage, match) => {
    return `${match[0]}(${functionParams(tokenStorage, match[1].trim())})`;
});

// MIN
tokenizer.rule(/\(([^,()]+),\s*([0-9]+)\)/, (tokenStorage, match) => {
    const idx = tokenStorage.add(match[0]);
    return `min(${toTokenLiteral(idx)}, ${match[1]})`;
});

// GTE
tokenizer.rule(/\(([^,()]+),\s*([^,()]+)\)/, (tokenStorage, match) => {
    const idx0 = tokenStorage.add(match[0]);
    const idx1 = tokenStorage.add(tokenizer.process(match[1].trim(), tokenStorage));
    return `gte(${toTokenLiteral(idx0)}, ${toTokenLiteral(idx1)})`;
});

// BRACKETS
tokenizer.rule(/\(([^,()]+)\)/, (tokenStorage, match) => {
    const idx = tokenStorage.add(tokenizer.process(match[0].trim(), tokenStorage));
    return `(${toTokenLiteral(idx)})`;
});

// ---

// OR
tokenizer.rule(/^([^ ]+ or [^ ]+(?: or [^ ]+)*)$/, (tokenStorage, match, fullMatch) => {
    const res = fullMatch.split(" or ").map((t) => {
        const idx = tokenStorage.add(tokenizer.process(t, tokenStorage));
        return `${toTokenLiteral(idx)}`;
    }).join(" or ");
    return res;
});

// AND
tokenizer.rule(/^([^ ]+ and [^ ]+(?: and [^ ]+)*)$/, (tokenStorage, match, fullMatch) => {
    const res = fullMatch.split(" and ").map((t) => {
        const idx = tokenStorage.add(tokenizer.process(t, tokenStorage));
        return `${toTokenLiteral(idx)}`;
    }).join(" and ");
    return res;
});

// NOT
tokenizer.rule(/^(?:not ([^,()\s]+|'[^']+'))$/, (tokenStorage, match) => {
    const idx = tokenStorage.add(tokenizer.process(match[0].trim(), tokenStorage));
    return `not ${toTokenLiteral(idx)}`;
});

// COMPARATOR
tokenizer.rule(/([^\s]+)\s*((?:!|>|<|=)?=|<|>)\s*([^\s]+|'[^']+')/, (tokenStorage, match) => {
    const idx0 = tokenStorage.add(tokenizer.process(match[0].trim(), tokenStorage));
    const idx1 = tokenStorage.add(tokenizer.process(match[2].trim(), tokenStorage));
    return `${toTokenLiteral(idx0)} ${match[1]} ${toTokenLiteral(idx1)}`;
});

// VALUE
tokenizer.rule(/^(?:[^\s]+|'[^']+')$/, (tokenStorage, match, fullMatch) => {
    return fullMatch;
});

const TEST_STRING = "(is_child and Sticks and (logic_spirit_sun_chest_no_rupees or (Silver_Rupee_Spirit_Temple_Sun_Block, 5)) and (Small_Key_Spirit_Temple, 5)) or (is_adult and (has_fire_source or (logic_spirit_sun_chest_bow and (Silver_Rupee_Spirit_Temple_Sun_Block, 5) and Bow)) and ((Small_Key_Spirit_Temple, 3) or spirit_temple_shortcuts)) or ((can_use(Dins_Fire) or (((Magic_Meter and Fire_Arrows) or (logic_spirit_sun_chest_bow and (Silver_Rupee_Spirit_Temple_Sun_Block, 5))) and Bow and Sticks and (logic_spirit_sun_chest_no_rupees or (Silver_Rupee_Spirit_Temple_Sun_Block, 5)))) and (has_explosives or ((Small_Key_Spirit_Temple, 2) and free_bombchu_drops)))";

const TOKEN_STRUCTURE = [
    "Dins_Fire",
    "can_use({{0}})",
    "Silver_Rupee_Spirit_Temple_Sun_Block",
    "min({{2}}, 5)",
    "Small_Key_Spirit_Temple",
    "min({{4}}, 5)",
    "min({{4}}, 3)",
    "min({{4}}, 2)",
    "logic_spirit_sun_chest_no_rupees",
    "{{8}} or {{3}}",
    "({{9}})",
    "is_child",
    "Sticks",
    "{{11}} and {{12}} and {{10}} and {{5}}",
    "({{13}})",
    "logic_spirit_sun_chest_bow",
    "Bow",
    "{{15}} and {{3}} and {{16}}",
    "({{17}})",
    "has_fire_source",
    "{{19}} or {{18}}",
    "({{20}})",
    "spirit_temple_shortcuts",
    "{{6}} or {{22}}",
    "({{23}})",
    "is_adult",
    "{{25}} and {{21}} and {{24}}",
    "({{26}})",
    "Magic_Meter",
    "Fire_Arrows",
    "{{28}} and {{29}}",
    "({{30}})",
    "{{15}} and {{3}}",
    "({{32}})",
    "{{31}} or {{33}}",
    "({{34}})",
    "{{35}} and {{16}} and {{12}} and {{10}}",
    "({{36}})",
    "{{1}} or {{37}}",
    "({{38}})",
    "free_bombchu_drops",
    "{{7}} and {{40}}",
    "({{41}})",
    "has_explosives",
    "{{43}} or {{42}}",
    "({{44}})",
    "{{39}} and {{45}}",
    "({{46}})",
    "{{14}} or {{27}} or {{47}}"
];

const ENTRY_POINT = "{{14}} or {{27}} or {{47}}";

describe("Tokenizer", () => {
    it("should tokenize string", () => {
        const resultToken = new TokenStorage();
        const entryPoint = tokenizer.process(TEST_STRING, resultToken);
        assert.equal(entryPoint, ENTRY_POINT);
        assert.deepStrictEqual([...resultToken], TOKEN_STRUCTURE);
    });
    it("should reassemble string", () => {
        const resultToken = new TokenStorage();
        for (const entry of TOKEN_STRUCTURE) {
            resultToken.add(entry);
        }
        const combined = Tokenizer.combine(ENTRY_POINT, resultToken);
        assert.equal(combined.replace(/min\(/g, "("), TEST_STRING);
    });
});
