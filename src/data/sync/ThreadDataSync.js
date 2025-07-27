import Path from "../../util/file/Path.js";
import SharedWorkerRegistry from "../../worker/SharedWorkerRegistry.js";

const MODULE_PATH = new Path(import.meta.url);

function getWorker() {
    if (SharedWorkerRegistry.isSupported()) {
        if (SharedWorkerRegistry.supportsType("module")) {
            const workerPath = MODULE_PATH.getAbsolute("./worker/ThreadDataSync.w.js");
            return SharedWorkerRegistry.register("ThreadDataSync", workerPath, "module");
        }
        const workerPath = MODULE_PATH.getAbsolute("./worker/ThreadDataSync.leg_w.js");
        return SharedWorkerRegistry.register("ThreadDataSync", workerPath);
    }
}

class ThreadDataSync extends EventTarget {

    #worker = getWorker();

    constructor() {
        super();
        /* --- */
        if (this.#worker != null) {
            this.#worker.addEventListener("message", (event) => {
                const ev = new Event("message");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
        }
    }

    postMessage(msg = {}) {
        if (this.#worker != null) {
            this.#worker.postMessage(msg);
        }
    }

}

export default new ThreadDataSync();
