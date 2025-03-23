
if (!("Worker" in window)) {
    throw new Error("This Browser does not support Workers");
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
        const worker = new Worker("blob://", tester);
        worker.terminate();
    } catch {
        // ignore
    }
    if (!supports) {
        console.warn("module type in Worker not supported");
    }
    return supports;
})();

const ALLOWED_TYPES = ["classic"];
if (SUPPORTS_WORKER_TYPE) {
    ALLOWED_TYPES.push("module");
}
const WORKER = new Map();

class WorkerRegistry {

    supportsType() {
        return SUPPORTS_WORKER_TYPE;
    }

    register(name, path, type = ALLOWED_TYPES[0]) {
        if (!ALLOWED_TYPES.includes(type)) {
            throw new Error(`Worker type "${type}" not supported, must be one of ["${ALLOWED_TYPES.join("\", \"")}"]`);
        }
        if (WORKER.has(name)) {
            throw new Error(`Worker with name "${name}" already registered`);
        } else {
            const worker = new Worker(path, {
                name,
                type
            });
            WORKER.set(name, worker);
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
            worker.terminate();
        }
    }

}

export default new WorkerRegistry();
