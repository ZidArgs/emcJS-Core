// frameworks
import Context from "../Context.js";

const GlobalContext = new Context();
globalThis.GlobalContext = GlobalContext;

export default GlobalContext;
