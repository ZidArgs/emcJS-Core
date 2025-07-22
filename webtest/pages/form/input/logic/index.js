import {
    loadForm, init
} from "../../util/formLoader.js";

await init();
await loadForm(false);

const logicTestEl = document.getElementById("logicTest");
logicTestEl.addOperatorGroup("states");
logicTestEl.addOperatorGroup("values");
