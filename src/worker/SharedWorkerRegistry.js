import NotSupportedError from "../exceptions/NotSupportedError.js";

if (!("SharedWorker" in window)) {
    throw new NotSupportedError("This Browser does not support SharedWorkers");
}

const SUPPORTS_WORKER_TYPE = (() => {
    let supports = false;
    const tester = {
        get type() {
            supports = true;
            return super.type;
        }
    };
    try {
        const worker = new SharedWorker("blob://", tester);
        worker.close();
    } catch {
        // ignore
    }
    if (!supports) {
        console.warn("module type in SharedWorker not supported");
    }
    return supports;
})();

const ALLOWED_TYPES = ["classic"];
if (SUPPORTS_WORKER_TYPE) {
    ALLOWED_TYPES.push("module");
}
const WORKER = new Map();

class SharedWorkerRegistry {

    supports(type) {
        return ALLOWED_TYPES.includes(type);
    }

    register(name, path, type = ALLOWED_TYPES[0]) {
        if (!this.supports(type)) {
            throw new Error(`Worker type "${type}" not supported, must be one of ["${ALLOWED_TYPES.join("\", \"")}"]`);
        }
        if (WORKER.has(name)) {
            throw new Error(`Worker with name "${name}" already registered`);
        } else {
            const worker = (new SharedWorker(path, {
                name,
                type
            })).port;
            WORKER.set(name, worker);
            worker.start();
            return worker;
        }
    }

    get(name) {
        if (!WORKER.has(name)) {
            throw new Error(`No Worker with name "${name}" registered`);
        } else {
            return WORKER.get(name);
        }
    }

    has(name) {
        return WORKER.has(name);
    }

    unregister(name) {
        if (WORKER.has(name)) {
            const worker = WORKER.get(name);
            WORKER.delete(name);
            worker.close();
        }
    }

}

export default new SharedWorkerRegistry();
