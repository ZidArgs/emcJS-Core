import MessagePortHandler from "./util/MessagePortHandler.js";

MessagePortHandler.addEventListener("message", (event) => {
    const port = event.port;
    MessagePortHandler.sendAllButOne(event.data, port);
});
