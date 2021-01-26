
import AsyM from "../../src/util/import/AsyM.js";

(async () => {
    const [
        [Async, {named: namedAsync}],
        [Sync, {named: namedSync}],
        [Normal, {named: namedNormal}]
    ] = await AsyM.import([
        "/_demo/asym/async.js",
        "/_demo/asym/sync.js",
        "/_demo/asym/normal.js"
    ]);

    console.log(Normal, Async, namedAsync, namedSync, namedNormal, Sync);
})();
