// main
import "/emcJS/ui/Page.js";
import TypeConfigMap from "/emcJS/data/type/TypeConfigMap.js";
import TypeEntity from "/emcJS/data/type/TypeEntity.js";
import TypeValidator from "/emcJS/util/type/TypeValidator.js";
import Logger from "/emcJS/util/log/Logger.js";

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
