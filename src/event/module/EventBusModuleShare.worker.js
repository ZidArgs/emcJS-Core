const PORTS = new Set;
let MAIN = null;

function handleConnect(event) {
    const port = event.ports[0];
    if (MAIN == null) {
        MAIN = port;
    } else {
        MAIN.postMessage({name:"new-instance", data:{}});
    }
    PORTS.add(port);
    port.addEventListener("message", (event) => {
        handleMessage(port, event);
    });
    port.start();
}

function handleDisconnect(event) {
    PORTS.remove(event.ports[0]);
}

function handleMessage(p, event) {
    const msg = event.data;
    for (const port of PORTS) {
        if (port == p) {
            continue;
        }
        port.postMessage(msg);
    }
}

self.addEventListener("connect", handleConnect);
self.addEventListener("disconnect", handleDisconnect);
