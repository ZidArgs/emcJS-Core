// main
import "/emcJS/ui/Page.js";
import "/emcJS/ui/dataview/datalist/DataList.js";
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

const list0El = document.getElementById("list-0");
list0El.setData([
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

const list1El = document.getElementById("list-1");
list1El.setData([
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

const list2El = document.getElementById("list-2");
list2El.setData([
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

const listRemoteEl = document.getElementById("list-remote");
new RemoteDataProvider(listRemoteEl, "/api/data");
