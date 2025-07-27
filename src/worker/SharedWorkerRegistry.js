const IS_SUPPORTED = "SharedWorker" in window;

const SUPPORTS_WORKER_TYPE = (() => {
    if (!IS_SUPPORTED) {
        console.warn("SharedWorker is not supported");
        return false;
    }
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
        console.warn("type \"module\" in SharedWorker is not supported");
    }
    return supports;
})();

const ALLOWED_TYPES = ["classic"];
if (SUPPORTS_WORKER_TYPE) {
    ALLOWED_TYPES.push("module");
}

const WORKER = new Map();

class SharedWorkerRegistry {

    isSupported() {
        return IS_SUPPORTED;
    }

    supportsType(type) {
        return ALLOWED_TYPES.includes(type);
    }

    register(name, path, type = ALLOWED_TYPES[0]) {
        if (!this.isSupported()) {
            throw new Error(`can't register SharedWorker: not supported`);
        }
        if (!this.supportsType(type)) {
            throw new Error(`can't register SharedWorker: type "${type}" not supported`);
        }
        if (WORKER.has(name)) {
            throw new Error(`can't register SharedWorker: name "${name}" already registered`);
        }
        const worker = (new SharedWorker(path, {
            name,
            type
        })).port;
        WORKER.set(name, worker);
        worker.start();
        return worker;
    }

    get(name) {
        return WORKER.get(name);
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
