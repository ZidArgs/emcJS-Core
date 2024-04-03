// main
import "/emcJS/ui/Page.js";
import "/emcJS/ui/grid/DataGrid.js";
import TypeConfigMap from "/emcJS/data/type/TypeConfigMap.js";
import TypeEntity from "/emcJS/data/type/TypeEntity.js";
import TypeValidator from "/emcJS/util/type/TypeValidator.js";
import Logger from "/emcJS/util/log/Logger.js";
import i18n from "/emcJS/util/I18n.js";
import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import RemoteDataProvider from "/emcJS/util/dataprovider/RemoteDataProvider.js";

(new OptionGroupRegistry("ImageSelect")).setAll({
    "": "",
    "/icons/area.svg": "Area",
    "/icons/bean.svg": "Bean",
    "/icons/chest.svg": "Chest",
    "/icons/cow.svg": "Cow",
    "/icons/dungeon_boss.svg": "Dungeon Boss",
    "/icons/dungeon.svg": "Dungeon",
    "/icons/entrance.svg": "Entrance",
    "/icons/fairy_fountain.svg": "Fairy Fountain",
    "/icons/gossipstone.svg": "Gossipstone",
    "/icons/grotto.svg": "Grotto",
    "/icons/interior.svg": "Interior",
    "/icons/location.svg": "Location",
    "/icons/scrub.svg": "Scrub",
    "/icons/skulltula.svg": "Skulltula"
});

i18n.setTranslation("de", {
    "test.blablabla": "Delphin",
    "test.bluiuiui": "Schmetterling",
    "test.blöbliblup": "Silberfuchs"
});

const grid0El = document.getElementById("grid0");
grid0El.setData([
    {
        key: "0",
        i18n: "test.blablabla",
        A: 1,
        B: "Cheese",
        C: 3,
        E: "2016-03-02T12:34:51"
    },
    {
        key: "1",
        i18n: "test.bluiuiui",
        A: 2,
        B: "Pizza",
        D: true,
        E: "2022-12-28T16:27:19"
    },
    {
        key: "2",
        i18n: "test.blöbliblup",
        A: 3,
        C: -15,
        D: false,
        E: new Date()
    }
]);

const grid1El = document.getElementById("grid1");
grid1El.setData([
    {
        key: "0",
        i18n: "test.blablabla",
        A: 1,
        B: "Cheese",
        C: 3,
        D: {type: "true"},
        E: "2016-03-02T12:34:51"
    },
    {
        key: "1",
        i18n: "test.bluiuiui",
        A: 2,
        B: "Pizza",
        D: true,
        E: "2022-12-28T16:27:19"
    },
    {
        key: "2",
        i18n: "test.blöbliblup",
        A: 3,
        C: -15,
        D: false,
        E: new Date()
    }
]);

const grid2El = document.getElementById("grid2");
grid2El.setData([
    {
        key: "0",
        i18n: "test.blablabla",
        A: 1,
        B: "Cheese",
        C: 3,
        E: "2016-03-02T12:34:51"
    },
    {
        key: "1",
        i18n: "test.bluiuiui",
        A: 2,
        B: "Pizza",
        D: true,
        E: "2022-12-28T16:27:19"
    },
    {
        key: "2",
        i18n: "test.blöbliblup",
        A: 3,
        C: -15,
        D: false,
        E: new Date(),
        F: new Date(),
        G: new Date()
    }
]);

const gridRemoteEl = document.getElementById("grid-remote");
new RemoteDataProvider(gridRemoteEl, "/api/data");

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
                    {
                        "type": "true"
                    },
                    {
                        "type": "sdaggasdg"
                    }
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
        "logic": {
            "type": "true"
        }
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
