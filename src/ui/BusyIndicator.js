import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";
import ActiveCounter from "../util/ActiveCounter.js";

// TODO should be self managed html element

const TPL = new Template(`
<slot>
    <div id="default-animation">
    </div>
</slot>
`);

const STYLE = new GlobalStyle(`
@keyframes rotate {
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
}
:host {
    position: absolute;
    display: none;
    justify-content: center;
    align-items: center;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    pointer-events: none;
    z-index: 9999999999;
    background: rgba(0,0,0,0.3);
    transform: translateZ(0);
}
:host(.active) {
    display: flex;
}
#default-animation {
    width: 50vmin;
    height: 50vmin;
    border-radius: 50%;
    background: conic-gradient(rgba(255, 255, 255, 0) 220deg, rgba(255, 255, 255, 1) 360deg);
    animation: rotate 1s linear infinite;
}
`);

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

    setIndicator(element) {
        if (element instanceof HTMLElement) {
            EL.append(element);
        }
    }

}

export default new BusyIndicator;
