import {
    describe, it
} from "node:test";
import assert from "assert";
import TypeConfigMap from "../../../src/data/type/TypeConfigMap.js";
import TypeValidator from "../../../src/util/type/TypeValidator.js";

globalThis.HTMLElement = class HTMLElement {};

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
            "types": ["Exit"]
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
                "types": ["Exit"]
            }
        },
        "logic": {
            "@type": "Logic",
            "optional": true
        }
    }
});

const ERRORNOUS_OBJECT_A = {
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
            "content": [{"type": "true"}, {"type": "sdaggasdg"}]
        }
    }
};

const ERRORNOUS_OBJECT_B = {
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
};

const NOT_TYPE_ERROR = new Error(`Error validating value
    typeName has to be a string that is not empty and not "*"`);

const ERRORNOUS_OBJECT_A_ERROR = new Error(`Error validating value as "Connection"
    attributes restricted to "type" and "name" [ | A | > target {AssociativeList} > "A" {Relation} ]
    not a valid logic [ | A | > logic {Logic} ]
    	unknown type "sdaggasdg" [ | > not > and > {1} > sdaggasdg ]`);

const ERRORNOUS_OBJECT_B_ERROR = new Error(`Error validating value as "Connection"
    dictionary expected [ | B | > target {AssociativeList} ]
    not a valid logic [ | B | > logic {Logic} ]
    	node can not be null [ | > not ]`);

describe("TypeValidator", () => {
    it("should throw error on empty typeName", () => {
        assert.throws(() => {
            TypeValidator.validate("", ERRORNOUS_OBJECT_A, {
                label: "",
                throwErrors: true,
                strict: true
            });
        }, NOT_TYPE_ERROR);
    });
    it("should throw error on wildcard typeName", () => {
        assert.throws(() => {
            TypeValidator.validate("*", ERRORNOUS_OBJECT_A, {
                label: "",
                throwErrors: true,
                strict: true
            });
        }, NOT_TYPE_ERROR);
    });
    it("should throw error on unknown type", () => {
        assert.throws(() => {
            TypeValidator.validate("Connection", ERRORNOUS_OBJECT_A, {
                label: "A",
                throwErrors: true,
                strict: true
            });
        }, ERRORNOUS_OBJECT_A_ERROR);
    });
    it("should throw error on null node", () => {
        assert.throws(() => {
            TypeValidator.validate("Connection", ERRORNOUS_OBJECT_B, {
                label: "B",
                throwErrors: true,
                strict: true
            });
        }, ERRORNOUS_OBJECT_B_ERROR);
    });
});
