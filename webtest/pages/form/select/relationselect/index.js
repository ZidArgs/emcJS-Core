import TypeConfigMap from "/emcJS/data/type/TypeConfigMap.js";
import TypeStorage from "/emcJS/data/type/TypeStorage.js";
import {
    loadForm, init
} from "../../util/formLoader.js";

TypeConfigMap.register("A", {
    "foobar": {
        "@type": "String",
        "optional": false,
        "default": ""
    }
});

TypeConfigMap.register("B", {
    "barfoo": {
        "@type": "String",
        "optional": false,
        "default": ""
    }
});

TypeConfigMap.register("C", {
    "baba": {
        "@type": "String",
        "optional": false,
        "default": ""
    }
});

const a = new TypeStorage("A");
a.set("test", {foobar: "test"});
a.set("banane", {foobar: "banane"});

const b = new TypeStorage("B");
b.set("test", {barfoo: "test"});
b.set("rosenkohl", {barfoo: "rosenkohl"});

const c = new TypeStorage("C");
c.set("test", {baba: "test"});
c.set("spinat", {baba: "spinat"});

await init();
await loadForm(false);
