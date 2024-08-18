// frameworks
import Import from "../../util/import/Import.js";
import Path from "../../util/file/Path.js";

const path = new Path(import.meta.url);

async function getWorker() {
    if ("SharedWorker" in window) {
        const [SharedWorkerRegistry] = await Import.module("../../worker/SharedWorkerRegistry.js");
        if (SharedWorkerRegistry.supports("module")) {
            const workerPath = path.getAbsolute("./ThreadDataSync.w.js");
            return SharedWorkerRegistry.register("ThreadDataSync", workerPath, "module");
        }
        const workerPath = path.getAbsolute("./ThreadDataSync.leg_w.js");
        return SharedWorkerRegistry.register("ThreadDataSync", workerPath);
    }
}

const SHARED_WORKER = await getWorker();

class ThreadDataSync extends EventTarget {

    constructor() {
        super();
        /* --- */
        if (SHARED_WORKER != null) {
            SHARED_WORKER.addEventListener("message", (event) => {
                const ev = new Event("message");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
        }
    }

    postMessage(msg = {}) {
        if (SHARED_WORKER != null) {
            SHARED_WORKER.postMessage(msg);
        }
    }

}

export default new ThreadDataSync();
