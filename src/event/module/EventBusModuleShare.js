import EventBusAbstractModule from "./EventBusAbstractModule.js";
import Path from "../../util/Path.js";
import SharedWorkerRegistry from "../../worker/SharedWorkerRegistry.js";

const path = new Path(import.meta.url);
const WORKER_PATH = path.getAbsolute("./EventBusModuleShare.worker.js");
const WORKER = SharedWorkerRegistry.register("EventWorker", WORKER_PATH);

class EventBusModuleShare extends EventBusAbstractModule {

    constructor() {
        super();
        if (WORKER) {
            WORKER.onmessage = function(e) {
                const payload = e.data;
                this.onModuleEvent(payload);
            }.bind(this);
            WORKER.start();
        }
    }

    async triggerModuleEvent(payload) {
        if (WORKER) {
            WORKER.postMessage(payload);
        }
    }

}

export default new EventBusModuleShare();
