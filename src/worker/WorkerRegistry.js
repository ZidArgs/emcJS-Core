const IS_SUPPORTED = "Worker" in window;

const SUPPORTS_WORKER_TYPE = (() => {
    if (!IS_SUPPORTED) {
        console.warn("Worker is not supported");
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
        const blob = new Blob(["self.onconnect = () => console.log(\"Worker started\")"], {type: "text/javascript"});
        const workerURL = window.URL.createObjectURL(blob);
        const worker = new Worker(workerURL, tester);
        worker.close();
    } catch {
        console.error("error checking for module worker support");
    }
    if (!supports) {
        console.warn("type \"module\" in Worker is not supported");
    }
    return supports;
})();

const ALLOWED_TYPES = ["classic"];
if (SUPPORTS_WORKER_TYPE) {
    ALLOWED_TYPES.push("module");
}

const WORKER = new Map();

class WorkerRegistry {

    isSupported() {
        return IS_SUPPORTED;
    }

    supportsType(type) {
        return ALLOWED_TYPES.includes(type);
    }

    register(name, path, type = ALLOWED_TYPES[0]) {
        if (!this.isSupported()) {
            throw new Error(`can't register Worker: not supported`);
        }
        if (!this.supportsType(type)) {
            throw new Error(`can't register Worker: type "${type}" not supported`);
        }
        if (WORKER.has(name)) {
            throw new Error(`can't register Worker: name "${name}" already registered`);
        }
        const worker = new Worker(path, {
            name,
            type
        });
        WORKER.set(name, worker);
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

export default new WorkerRegistry();
