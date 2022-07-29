const PortHandler = (function() {
    const PORTS = new Set;

    class PortHandler extends EventTarget {

        constructor() {
            super();
            self.addEventListener("connect", (event) => {
                for (const port of event.ports) {
                    PORTS.add(port);
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
                PORTS.remove(event.ports[0]);
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
            for (const p of PORTS) {
                p.postMessage(msg);
            }
            self.postMessage?.(msg);
        }

        sendAllButOne(msg, port) {
            if (port instanceof MessagePort) {
                for (const p of PORTS) {
                    if (p == port) {
                        continue;
                    }
                    p.postMessage(msg);
                }
            }
            self.postMessage?.(msg);
        }

    }

    return new PortHandler();
})();

self.PortHandler = PortHandler;
