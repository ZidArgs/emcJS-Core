
if (!("Worker" in window)) {
    throw new Error("This Browser does not support Workers");
}

const ALLOWED_TYPES = ["classic"/*, "module"*/];
const WORKER = new Map();

class WorkerRegistry {

    register(name, path, type) {
        if (!ALLOWED_TYPES.includes(type)) {
            type = ALLOWED_TYPES[0];
        }
        if (WORKER.has(name)) {
            throw new Error(`Worker with name "${name}" already registered`);
        } else {
            const worker = new Worker(path, {name, type});
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
