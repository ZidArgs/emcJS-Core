// main
import "/emcJS/ui/Page.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
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

const grid0El = document.getElementById("grid-0");
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

const grid1El = document.getElementById("grid-1");
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

const grid2El = document.getElementById("grid-2");
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

const gridRemoteSimpleEl = document.getElementById("grid-remote-simple");
const controlToolbarSimpleEl = document.getElementById("control-toolbar-simple");
new RemoteDataProvider(gridRemoteSimpleEl, "/api/data/simple", {
    multiSort: true,
    config: {
        sort: ["name", "!desc"],
        pageSize: 15
    },
    toolbar: controlToolbarSimpleEl
});

const gridRemoteLargeEl = document.getElementById("grid-remote-large");
const controlToolbarLargeEl = document.getElementById("control-toolbar-large");
new RemoteDataProvider(gridRemoteLargeEl, "/api/data/large", {
    multiSort: true,
    config: {pageSize: 15},
    toolbar: controlToolbarLargeEl
});
gridRemoteLargeEl.addEventListener("sort-change", (event) => {
    const {
        newOrder, oldOrder
    } = event;
    console.log("sort change", newOrder, oldOrder);
});
