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
            throw new TypeError("node must be an instance of Node");
        }
        if (!this.isObserving(node)) {
            this.#observedNodes.add(new WeakRef(node));
            this.#mutationObserver.observe(node, this.#config);
        }
    }

    unobserve(node) {
        if (!(node instanceof Node)) {
            throw new TypeError("node must be an instance of Node");
        }
        const nodeRef = this.#getNodeRef(node);
        if (nodeRef != null) {
            this.#observedNodes.delete(nodeRef);
            this.#refreshObserver();
        }
    }

    isObserving(node) {
        if (!(node instanceof Node)) {
            throw new TypeError("node must be an instance of Node");
        }
        for (const ref of this.#observedNodes) {
            const derefNode = ref.deref();
            if (derefNode === node) {
                return true;
            }
        }
        return false;
    }

    clear() {
        this.#observedNodes.clear();
        this.#mutationObserver.disconnect();
    }

    #getNodeRef(node) {
        for (const ref of this.#observedNodes) {
            const derefNode = ref.deref();
            if (derefNode === node) {
                return ref;
            }
        }
    }

    #refreshObserver() {
        this.#mutationObserver.disconnect();
        for (const ref of this.#observedNodes) {
            const derefNode = ref.deref();
            if (derefNode == null) {
                this.#observedNodes.delete(ref);
            } else {
                this.#mutationObserver.observe(derefNode, this.#config);
            }
        }
    }

}
