import AsyM from "../../src/util/import/AsyM.js";

export default new AsyM(() => {
    console.log("run sync");

    return {
        default: 6,
        named: 4
    };
});
