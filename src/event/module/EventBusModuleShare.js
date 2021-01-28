import EventBusAbstractModule from "./EventBusAbstractModule.js";
import Path from "../../util/Path.js";

const path = new Path(import.meta.url);

let WORKER = null;
if ("SharedWorker" in window) {
    WORKER = (new SharedWorker(path.getAbsolute("./EventBusModuleShare.worker.js"), "EventWorker")).port;
}

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
