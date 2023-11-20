// main
import CellRenderer from "/emcJS/util/grid/CellRenderer.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/grid/DataGrid.js";
import TypeValidator from "/emcJS/util/TypeValidator.js";

CellRenderer.registerCellRenderer("currency", (cellEl, value, options) => {
    cellEl.style.textAlign = "end";
    /* --- */
    if (value == null) {
        cellEl.classList.add("empty");
    } else {
        cellEl.classList.remove("empty");
    }
    value = parseFloat(value) || 0;
    const {negativeColor, prefix, postfix, decimals} = options;
    if (negativeColor != null && value < 0) {
        cellEl.style.color = negativeColor;
    } else {
        cellEl.style.color = "";
    }
    let text = "";
    if (prefix != null) {
        text += prefix;
    }
    if (decimals != null) {
        text += value.toFixed(parseInt(decimals) || undefined);
    } else {
        text += value;
    }
    if (postfix != null) {
        text += postfix;
    }
    cellEl.innerText = text;
});

CellRenderer.registerCellRenderer(null, (cellEl, value) => {
    if (value != null) {
        cellEl.classList.remove("empty");
        cellEl.innerText = value;
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "(---)";
    }
});

const grid0El = document.getElementById("grid0");
grid0El.setData([
    {
        A: 1,
        B: "Cheese",
        C: 3,
        E: "2.3.16 12:34:51"
    }, {
        A: 2,
        B: "Pizza",
        D: true,
        E: "12.28.2022 16:27:19"
    },
    {
        A: 3,
        C: -15,
        D: false,
        E: new Date()
    }
]);

const grid1El = document.getElementById("grid1");
grid1El.setData([
    {
        A: 1,
        B: "Cheese",
        C: 3,
        E: "2.3.16 12:34:51"
    }, {
        A: 2,
        B: "Pizza",
        D: true,
        E: "12.28.2022 16:27:19"
    },
    {
        A: 3,
        C: -15,
        D: false,
        E: new Date()
    }
]);

const grid2El = document.getElementById("grid2");
grid2El.setData([
    {
        A: 1,
        B: "Cheese",
        C: 3,
        E: "2.3.16 12:34:51"
    }, {
        A: 2,
        B: "Pizza",
        D: true,
        E: "12.28.2022 16:27:19"
    },
    {
        A: 3,
        C: -15,
        D: false,
        E: new Date()
    }
]);

TypeValidator.registerType("Coordinates", {
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
});

TypeValidator.registerType("Connection", {
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
                "value": "test",
                "type": "Area"
            }
        },
        "target": {
            "A": {
                "value": "test",
                "type": "Exit"
            }
        }
    }, true, "A");
} catch (err) {
    console.error(err);
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
                "value": "test",
                "type": "Exit"
            }
        ]
    }, true, "B");
} catch (err) {
    console.error(err);
}
