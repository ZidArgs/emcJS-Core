import ActiveCounter from "../util/ActiveCounter.js";
import TPL from "./BusyIndicator.js.html" assert {type: "html"};
import STYLE from "./BusyIndicator.js.css" assert {type: "css"};

// TODO should be self managed html element

const EL = document.createElement("DIV");
EL.className = "busy-indicator";
EL.attachShadow({mode: "open"});
EL.shadowRoot.append(TPL.generate());
STYLE.apply(EL.shadowRoot);
document.body.append(EL);

const activeCounter = new ActiveCounter();
activeCounter.addEventListener("active", (event) => {
    if (event.data) {
        EL.classList.add("active");
    } else {
        EL.classList.remove("active");
    }
});

class BusyIndicator {

    async busy() {
        activeCounter.add();
    }

    async unbusy() {
        activeCounter.remove();
    }

    async watch(promise) {
        if (promise instanceof Promise) {
            try {
                await this.busy();
                const result = promise();
                await this.unbusy();
                return result;
            } catch (err) {
                await this.unbusy();
                throw err;
            }
        }
    }

    setIndicator(element) {
        if (element instanceof HTMLElement) {
            EL.append(element);
        }
    }

}

export default new BusyIndicator;
