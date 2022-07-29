import PortHandler from "../../worker/modules/PortHandler.js";

PortHandler.addEventListener("message", (event) => {
    const port = event.port;
    PortHandler.sendAllButOne(event.data, port);
});
