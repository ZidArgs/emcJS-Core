// main
import "/emcJS/ui/Page.js";
import Import from "/emcJS/util/import/Import.js";

const loadButtonEl = document.getElementById("load-button");

loadButtonEl.addEventListener("click", once(() => {
    Import.module("/emcJS/ui/navigation/NavBar.js");
    Import.module("/emcJS/ui/dataview/datagrid/DataGrid.js");
    Import.module("/emcJS/ui/dataview/datalist/DataList.js");
    Import.module("/emcJS/ui/dataview/toolbar/DataViewControlToolbar.js");
}));

function once(callback) {
    let hasRun = false;
    return function(...args) {
        if (!hasRun) {
            hasRun = true;
            callback(...args);
        }
    };
}
