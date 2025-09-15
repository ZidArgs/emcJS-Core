import Inflate from "./zip/Inflate.js";

const zipArchive = await fetch("./toot-backup-test.zip");

window.extractedArchive = await Inflate.extractArchive(await zipArchive.arrayBuffer());
