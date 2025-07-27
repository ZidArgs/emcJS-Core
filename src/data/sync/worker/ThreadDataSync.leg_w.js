importScripts(new URL("../../../worker/util/legacy/MessagePortHandler.js", location));
const MessagePortHandler = self.MessagePortHandler;

MessagePortHandler.addEventListener("message", (event) => {
    const port = event.port;
    MessagePortHandler.sendAllButOne(event.data, port);
});
