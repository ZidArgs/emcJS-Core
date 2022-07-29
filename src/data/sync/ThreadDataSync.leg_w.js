self.importScripts(`/emcJS/worker/legacy/PortHandler.js`);

self.PortHandler.addEventListener("message", (event) => {
    const port = event.port;
    self.PortHandler.sendAllButOne(event.data, port);
});
