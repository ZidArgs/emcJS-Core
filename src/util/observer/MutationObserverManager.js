export default class MutationObserverManager {

    #config;

    #mutationObserver;

    #observedNodes = new Set();

    constructor(config, handler) {
        this.#config = config;
        this.#mutationObserver = new MutationObserver(handler);
    }

    observe(node) {
        if (!(node instanceof Node)) {
            throw new TypeError("can only observe Nodes");
        }
        if (!this.#observedNodes.has(node)) {
            this.#observedNodes.add(new WeakRef(node));
            this.#mutationObserver.observe(node, this.#config);
        }
    }

    unobserve(node) {
        if (node instanceof Node && this.#observedNodes.has(node)) {
            this.#mutationObserver.disconnect();
            for (const ref of this.#observedNodes) {
                const node = ref.deref();
                if (node == null) {
                    this.#observedNodes.delete(ref);
                } else {
                    this.#mutationObserver.observe(node, this.#config);
                }
            }
        }
    }

    disconnect() {
        this.#observedNodes.clear();
        this.#mutationObserver.disconnect();
    }

}
