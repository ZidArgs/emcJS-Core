import {
    buildForm, init
} from "../util/formBuilder.js";

await init();
await buildForm(import.meta.url, false);
