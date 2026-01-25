/**
 * This is some messed up hack to determine when an
 * element got conencted into the dom
 */
class ConnectedHook extends HTMLElement {

    #onConnected;

    constructor(onConnected) {
        super();
        this.#onConnected = onConnected;
    }

    connectedCallback() {
        this.#onConnected();
    }

}

customElements.define("emc-hook-element-connected", ConnectedHook);

export default class IsConnectedObserver {

    #onConnected;

    constructor(onConnected) {
        this.#onConnected = onConnected;
    }

    observe(observedEl) {
        if (!observedEl.isConnected) {
            const hookEl = new ConnectedHook(() => {
                hookEl.remove();
                this.#onConnected(observedEl);
            });
            observedEl.append(hookEl);
        } else {
            this.#onConnected(observedEl);
        }
    }

}
