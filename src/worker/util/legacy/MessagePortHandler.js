if (!self.MessagePortHandler) {
    class MessagePortHandler extends EventTarget {

        #ports = new Set();

        constructor() {
            super();
            self.addEventListener("connect", (event) => {
                for (const port of event.ports) {
                    this.#ports.add(port);
                    port.addEventListener("message", (event) => {
                        const ev = new Event("message");
                        ev.port = port;
                        ev.data = event.data;
                        this.dispatchEvent(ev);
                    });
                    const ev = new Event("connect");
                    ev.port = port;
                    this.dispatchEvent(ev);
                    port.start();
                }
            });
            self.addEventListener("disconnect", (event) => {
                for (const port of event.ports) {
                    this.#ports.remove(port);
                }
                if (!this.#ports.size()) {
                    self.close();
                }
            });
            self.addEventListener("message", (event) => {
                const ev = new Event("message");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
        }

        sendOne(msg, port) {
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

        sendAllButOne(msg, port) {
            if (port instanceof MessagePort) {
                for (const p of this.#ports) {
                    if (p === port) {
                        continue;
                    }
                    p.postMessage(msg);
                }
            }
            self.postMessage?.(msg);
        }

    }

    self.MessagePortHandler = new MessagePortHandler();
}
