class PortHandler extends EventTarget {

    #ports = new Set();

    constructor() {
        super();
        self.addEventListener("connect", event => {
            const port = event.ports[0];
            this.#ports.add(port);
            port.addEventListener("message", event => {
                const ev = new Event("message");
                ev.port = port;
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
            port.start();
        });
        self.addEventListener("disconnect", event => {
            this.#ports.remove(event.ports[0]);
        });
        self.addEventListener("message", event => {
            const ev = new Event("message");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
    }

    sendOne(port, msg) {
        if (port instanceof MessagePort) {
            port.postMessage(msg);
        }
        self.postMessage?.(msg);
    }

    sendAll(msg) {
        for (const p of this.#ports) {
            p.postMessage(msg);
        }
        self.postMessage?.(msg);
    }

    sendAllButOne(port, msg) {
        if (port instanceof MessagePort) {
            for (const p of this.#ports) {
                if (p == port) {
                    continue;
                }
                p.postMessage(msg);
            }
        }
    }

}

export default new PortHandler();
