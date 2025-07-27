self.importScripts(`/emcJS/worker/util/legacy/MessagePortHandler.js`);

const MessagePortHandler = self.MessagePortHandler;

MessagePortHandler.addEventListener("message", (event) => {
    const port = event.port;
    MessagePortHandler.sendAllButOne(event.data, port);
});
