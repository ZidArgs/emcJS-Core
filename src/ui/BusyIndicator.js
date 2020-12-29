import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";

// TODO should be self managed html element
// TODO track html elements for static OP
// TODO static busy/unbusy

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
EL.attachShadow({mode: 'open'});
EL.shadowRoot.append(TPL.generate());
STYLE.apply(EL.shadowRoot);
document.body.append(EL);

let COUNT = 0;

class BusyIndicator {

    busy() {
        return new Promise(function(resolve) {
            if (COUNT++ == 0) {
                EL.style.display = "flex";
                setTimeout(resolve, 0);
            } else {
                resolve();
            }
        });
    }

    unbusy() {
        return new Promise(function(resolve) {
            if (COUNT > 0 && --COUNT == 0) {
                EL.style.display = null;
                setTimeout(resolve, 0);
            } else {
                resolve();
            }
        });
    }

    setIndicator(element) {
        if (element instanceof HTMLElement) {
            EL.append(element);
        }
    }

}

export default new BusyIndicator;
