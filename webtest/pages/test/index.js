// main
import "/emcJS/ui/Page.js";
import TypeConfigMap from "/emcJS/data/type/TypeConfigMap.js";
import TypeEntity from "/emcJS/data/type/TypeEntity.js";
import TypeValidator from "/emcJS/util/type/TypeValidator.js";
import Logger from "/emcJS/util/log/Logger.js";
import Tokenizer, {toTokenLiteral} from "/emcJS/util/token/Tokenizer.js";
import TokenStorage from "/emcJS/util/token/TokenStorage.js";

TypeConfigMap.register("Coordinates", {
    "parameters": {},
    "definition": {
        "x": {
            "@type": "Number",
            "optional": false,
            "default": -1,
            "decimalPlaces": 0
        },
        "y": {
            "@type": "Number",
            "optional": false,
            "default": -1,
            "decimalPlaces": 0
        },
        "target": {
            "@type": "Relation",
            "optional": true,
            "types": [
                "Exit"
            ]
        }
    }
});

TypeConfigMap.register("Connection", {
    "parameters": {},
    "definition": {
        "label": {
            "@type": "String",
            "optional": false,
            "default": "",
            "pattern": ".+"
        },
        "posA": {
            "@type": "Coordinates",
            "optional": false
        },
        "posB": {
            "@type": "Coordinates",
            "optional": false
        },
        "target": {
            "@type": "AssociativeList",
            "optional": false,
            "children": {
                "@type": "Relation",
                "optional": true,
                "types": [
                    "Exit"
                ]
            }
        },
        "logic": {
            "@type": "Logic",
            "optional": true
        }
    }
});

try {
    TypeValidator.validate("Connection", {
        "label": "A",
        "posA": {
            "x": 898,
            "y": 683
        },
        "posB": {
            "x": 506,
            "y": 474,
            "target": {
                "type": "Exit",
                "name": "test"
            }
        },
        "target": {
            "A": {
                "type": "Exit",
                "value": "test"
            }
        },
        "logic": {
            "type": "not",
            "content": {
                "type": "and",
                "content": [
                    {"type": "true"},
                    {"type": "sdaggasdg"}
                ]
            }
        }
    }, {
        label: "A",
        throwErrors: true,
        strict: true
    });
} catch (err) {
    Logger.error(err);
}

try {
    TypeValidator.validate("Connection", {
        "label": "B",
        "posA": {
            "x": 898,
            "y": 683
        },
        "posB": {
            "x": 506,
            "y": 474
        },
        "target": [
            {
                "type": "Exit",
                "name": "test"
            }
        ],
        "logic": {
            "type": "not",
            "content": null
        }
    }, {
        label: "B",
        throwErrors: true,
        strict: true
    });
} catch (err) {
    Logger.error(err);
}

try {
    const entity = new TypeEntity("Connection", "foobar", {
        "label": "B",
        "posA": {
            "x": 898,
            "y": 683
        },
        "posB": {
            "x": 506,
            "y": 474
        },
        "target": {
            "A": {
                "type": "Exit",
                "name": "test"
            }
        },
        "logic": {"type": "true"}
    });
    console.log(entity.serialize());
    entity.set("label", "dafuq");
    console.log(entity.serialize());
    entity.set("label", 2);
} catch (err) {
    Logger.error(err, "test");
}

Logger.error("this is a test message", "test");
Logger.warn("this is a test message", "test");
Logger.info("this is a test message", "test");
Logger.log("this is a test message", "test");

/**
 * TOKENIZER
 */

const tokenizer = new Tokenizer();
const resultToken = new TokenStorage();
const testString = "(is_child and Sticks and (logic_spirit_sun_chest_no_rupees or (Silver_Rupee_Spirit_Temple_Sun_Block, 5)) and (Small_Key_Spirit_Temple, 5)) or (is_adult and (has_fire_source or (logic_spirit_sun_chest_bow and (Silver_Rupee_Spirit_Temple_Sun_Block, 5) and Bow)) and ((Small_Key_Spirit_Temple, 3) or spirit_temple_shortcuts)) or ((can_use(Dins_Fire) or (((Magic_Meter and Fire_Arrows) or (logic_spirit_sun_chest_bow and (Silver_Rupee_Spirit_Temple_Sun_Block, 5))) and Bow and Sticks and (logic_spirit_sun_chest_no_rupees or (Silver_Rupee_Spirit_Temple_Sun_Block, 5)))) and (has_explosives or ((Small_Key_Spirit_Temple, 2) and free_bombchu_drops)))";

function functionParams(term) {
    return term.split(",").map((el) => {
        const literal = tokenizer.process(el.trim(), resultToken);
        const idx = resultToken.add(literal);
        return toTokenLiteral(idx);
    }).join(", ");
}

// FUNCTIONS
tokenizer.rule(/([^()\s]+)\(([^()]+)\)/, (match) => {
    return `${match[0]}(${functionParams(match[1].trim())})`;
});

// MIN
tokenizer.rule(/\(([^,()]+),\s*([0-9]+)\)/, (match) => {
    const idx = resultToken.add(match[0]);
    return `min(${toTokenLiteral(idx)}, ${match[1]})`;
});

// GTE
tokenizer.rule(/\(([^,()]+),\s*([^,()]+)\)/, (match) => {
    const idx0 = resultToken.add(match[0]);
    const idx1 = resultToken.add(tokenizer.process(match[1].trim(), resultToken));
    return `gte(${toTokenLiteral(idx0)}, ${toTokenLiteral(idx1)})`;
});

// BRACKETS
tokenizer.rule(/\(([^,()]+)\)/, (match) => {
    const idx = resultToken.add(tokenizer.process(match[0].trim(), resultToken));
    return `(${toTokenLiteral(idx)})`;
});

// ---

// OR
tokenizer.rule(/^([^ ]+ or [^ ]+(?: or [^ ]+)*)$/, (match, fullMatch) => {
    const res = fullMatch.split(" or ").map((t) => {
        const idx = resultToken.add(tokenizer.process(t, resultToken));
        return `${toTokenLiteral(idx)}`;
    }).join(" or ");
    return res;
});

// AND
tokenizer.rule(/^([^ ]+ and [^ ]+(?: and [^ ]+)*)$/, (match, fullMatch) => {
    const res = fullMatch.split(" and ").map((t) => {
        const idx = resultToken.add(tokenizer.process(t, resultToken));
        return `${toTokenLiteral(idx)}`;
    }).join(" and ");
    return res;
});

// NOT
tokenizer.rule(/^(?:not ([^,()\s]+|'[^']+'))$/, (match) => {
    const idx = resultToken.add(tokenizer.process(match[0].trim(), resultToken));
    return `not ${toTokenLiteral(idx)}`;
});

// COMPARATOR
tokenizer.rule(/([^\s]+)\s*((?:!|>|<|=)?=|<|>)\s*([^\s]+|'[^']+')/, (match) => {
    const idx0 = resultToken.add(tokenizer.process(match[0].trim(), resultToken));
    const idx1 = resultToken.add(tokenizer.process(match[2].trim(), resultToken));
    return `${toTokenLiteral(idx0)} ${match[1]} ${toTokenLiteral(idx1)}`;
});

// VALUE
tokenizer.rule(/^(?:[^\s]+|'[^']+')$/, (match, fullMatch) => {
    return fullMatch;
});

const entryPoint = tokenizer.process(testString, resultToken);
console.log(entryPoint, [...resultToken]);

const combined = Tokenizer.combine(entryPoint, resultToken);
console.log("testString", testString);
console.log("combined", combined);
console.log("is restored?", testString === combined.replace(/min\(/g, "("));
