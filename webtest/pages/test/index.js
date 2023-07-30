// main
import CellRenderer from "/emcJS/util/grid/CellRenderer.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/grid/DataGrid.js";

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
