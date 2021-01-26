import AsyM from "../../src/util/import/AsyM.js";

export default new AsyM(async () => {
    console.log("run async");

    return {
        default: 2,
        named: 3
    };
});
