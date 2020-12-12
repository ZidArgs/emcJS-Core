import EventBusAbstractModule from "./EventBusAbstractModule.js";
import Path from "../Path.js";

let WORKER = null;
if ("SharedWorker" in window) {
    WORKER = (new SharedWorker(Path.getAbsolute(import.meta.url, "./EventBusModuleShare.worker.js"), 'EventWorker')).port;
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

    onModuleEvent(payload) {
        // nothing
    }

    async triggerModuleEvent(payload) {
        if (WORKER) {
            WORKER.postMessage(payload);
        }
    }

}

export default new EventBusModuleShare();
