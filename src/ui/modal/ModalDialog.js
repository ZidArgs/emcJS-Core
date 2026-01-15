import Modal from "./Modal.js";
import GlobalStyleVariables from "../../util/html/style/GlobalStyleVariables.js";
import "../form/button/Button.js";
import TPL from "./ModalDialog.js.html" assert {type: "html"};
import STYLE from "./ModalDialog.js.css" assert {type: "css"};

const promptIconPath = "m 91.733399,244.16417 c -14.986236,0 -27.835382,12.84915 -27.835382,27.83537 v 532.6015 c 0,14.98625 12.849146,27.82798 27.835382,27.82798 H 936.07245 c 14.98624,0 27.82556,-12.84173 27.82556,-27.82798 v -532.6015 c 0,-14.98622 -12.83932,-27.83537 -27.82556,-27.83537 z m 22.446541,50.28194 H 913.62595 V 782.15692 H 114.17994 Z m 544.33904,22.12494 v 50.28439 h 70.34465 V 709.74027 H 658.51898 V 760.0222 H 849.49995 V 709.74027 H 779.14556 V 366.85544 h 70.35439 v -50.28439 z m -406.87825,126.46462 -43.54768,25.13484 25.97447,44.98636 h -51.944 v 50.28193 h 51.94152 l -25.97199,44.98394 43.54768,25.13729 25.96959,-44.98639 25.97438,44.98639 43.53553,-25.13729 -25.9696,-44.98394 h 51.95136 v -50.28193 h -51.95136 l 25.9696,-44.98636 -43.53553,-25.13484 -25.97438,44.9839 z m 236.28897,0 -43.54771,25.13484 25.97442,44.98636 h -51.94397 v 50.28193 h 51.94155 l -25.972,44.98394 43.54771,25.13729 25.96955,-44.98639 25.97443,44.98639 43.53543,-25.13729 -25.96951,-44.98394 h 51.95135 V 513.15687 H 557.4396 l 25.96951,-44.98636 -43.53543,-25.13484 -25.97443,44.9839 z";
const confirmIconPath = "m 513.89801,88.296601 c -248.05384,0 -449.999995,201.946149 -449.999999,449.999979 0,248.05388 201.946159,450.00001 449.999999,450.00001 248.05384,0 450.00001,-201.94613 450.00001,-450.00001 0,-248.05383 -201.94617,-449.999979 -450.00001,-449.999979 z m 0,80.005859 c 204.81869,0 370.00196,165.17547 370.00196,369.99412 0,204.81869 -165.18327,370.00392 -370.00196,370.00392 -204.81865,0 -370.0039,-165.18523 -370.0039,-370.00392 0,-204.81865 165.18525,-369.99412 370.0039,-369.99412 z m 16.41014,104.47656 c -35.33499,0.27893 -69.44462,19.46185 -98.13475,40.08983 -9.05711,6.51205 -21.86328,25.33792 -21.86328,25.33792 -7.98127,12.83667 -10.52258,25.46505 -7.62501,37.88866 2.8975,12.42361 9.52275,21.85448 19.87502,28.29101 11.59439,7.20892 23.64257,9.5325 36.14453,6.9707 11.83862,-2.42593 21.64872,-9.46031 29.4336,-21.09959 h 0.002 c 0,0 24.02045,-28.41324 40.97072,-32.30861 7.66689,-1.7619 16.54761,0.63008 23.05078,5.05663 6.23217,4.24191 11.92595,11.26783 12.61133,18.77541 4.24154,46.45761 -39.35762,84.69611 -55.71095,128.38669 -4.8827,13.04501 -10.27903,26.10426 -12.62498,39.834 -4.69735,27.49145 -2.64065,83.62696 -2.64065,83.62696 1.46279,12.92145 7.19173,19.38085 17.18752,19.38085 8.77682,0 13.89653,-6.21857 15.35936,-18.65235 0,0 -1.43755,-56.45322 9.41994,-81.58398 9.42142,-21.80689 30.6963,-36.26165 45.94726,-54.47459 16.53842,-19.75038 37.64905,-36.50495 49.40232,-59.42774 9.16305,-17.87105 15.48514,-38.23809 15.1426,-58.31838 -0.41933,-24.5791 -4.32068,-52.60879 -20.95899,-70.70506 -23.00413,-25.01987 -61.00123,-37.3364 -94.9883,-37.06836 z M 513.28082,686.0427 c -15.11566,0 -28.03847,5.23929 -38.76564,15.72265 -10.72709,10.48346 -16.08982,23.04 -16.08982,37.66798 0,15.60321 5.36273,28.89021 16.08982,39.86131 10.97099,10.97099 24.13478,16.45705 39.49418,16.45705 14.87176,0 27.55173,-5.36459 38.03512,-16.09183 10.72721,-10.72717 16.09183,-23.40514 16.09183,-38.0332 0,-14.87172 -5.36462,-27.79272 -16.09183,-38.76366 -10.72713,-11.21485 -23.64809,-16.8203 -38.76366,-16.8203 z";
const alertIconPath = "m 513.89801,88.296601 c -248.05384,0 -449.999995,201.946149 -449.999999,449.999979 0,248.05388 201.946159,450.00001 449.999999,450.00001 248.05384,0 450.00001,-201.94613 450.00001,-450.00001 0,-248.05383 -201.94617,-449.999979 -450.00001,-449.999979 z m 0,80.005859 c 204.81869,0 370.00196,165.17547 370.00196,369.99412 0,204.81869 -165.18327,370.00392 -370.00196,370.00392 -204.81865,0 -370.0039,-165.18523 -370.0039,-370.00392 0,-204.81865 165.18525,-369.99412 370.0039,-369.99412 z m 2.95117,112.50001 c -13.77248,0 -25.33213,4.42749 -34.67773,13.28122 -9.3456,8.85377 -14.01759,20.90427 -14.01759,36.15235 0,17.2156 3.93472,62.95937 11.80471,137.23242 4.91872,48.20372 11.19039,100.3443 18.81445,156.41798 1.47561,13.03468 7.25447,19.55078 17.33787,19.55078 8.85377,0 14.01853,-6.27164 15.49417,-18.81445 5.90249,-51.89276 12.29734,-106.9824 19.18356,-165.26952 7.87,-75.74869 11.80471,-118.54145 11.80471,-128.37891 0,-15.24813 -4.5507,-27.4218 -13.6504,-36.5215 -9.09967,-9.09967 -19.79687,-13.65037 -32.09375,-13.65037 z m -2.95117,404.32226 c -15.24812,0 -28.28424,5.28601 -39.10548,15.86131 -10.82121,10.57531 -16.23047,23.24183 -16.23047,37.99805 0,15.74 5.40926,29.14375 16.23047,40.21096 11.06721,11.06718 24.34775,16.60154 39.84181,16.60154 15.00215,0 27.79189,-5.41119 38.36719,-16.23243 10.82125,-10.82124 16.23243,-23.61093 16.23243,-38.36715 0,-15.0022 -5.41118,-28.03635 -16.23243,-39.10353 -10.82124,-11.3131 -23.85539,-16.96875 -39.10352,-16.96875 z";
const errorIconPath = "m 505.5776,144.54773 a 40.027356,39.981637 0 0 0 -26.34016,19.11156 L 69.257818,872.95112 a 40.027356,39.981637 0 0 0 34.662532,59.96753 h 819.95728 a 40.027356,39.981637 0 0 0 34.66058,-59.96753 L 548.55859,163.65929 A 40.027356,39.981637 0 0 0 505.5776,144.54773 Z m 8.31847,119.05613 340.6565,589.35873 h -681.3091 z m 2.3965,125.76521 c -11.17477,0 -20.55418,3.59174 -28.13706,10.77552 -7.58287,7.18378 -11.37318,16.96227 -11.37318,29.33434 0,13.96846 3.19265,51.08507 9.57824,111.34901 3.99099,39.1117 9.07978,81.41637 15.26581,126.91366 1.1973,10.57612 5.88505,15.86347 14.06658,15.86347 7.18378,0 11.37513,-5.08879 12.57242,-15.26581 4.78919,-42.10494 9.97726,-86.80411 15.56464,-134.09734 6.38559,-61.46123 9.57824,-96.18139 9.57824,-104.16337 0,-12.37207 -3.69102,-22.24985 -11.07435,-29.63317 -7.38333,-7.38333 -16.06386,-11.07631 -26.04134,-11.07631 z m -2.39455,328.06063 c -12.37207,0 -22.94873,4.29062 -31.72891,12.87125 -8.78017,8.58063 -13.17007,18.85748 -13.17007,30.83045 0,12.77117 4.3899,23.64567 13.17007,32.6254 8.97974,8.97972 19.75495,13.46892 32.32658,13.46892 12.17251,0 22.5506,-4.38991 31.13123,-13.17009 8.78017,-8.78017 13.17009,-19.15632 13.17009,-31.12929 0,-12.17251 -4.38992,-22.74916 -13.17009,-31.72889 -8.78018,-9.17928 -19.35684,-13.76775 -31.7289,-13.76775 z";

const promptIconColor = GlobalStyleVariables.get("--modal-icon-success-color") ?? "#009952";
const confirmIconColor = GlobalStyleVariables.get("--modal-icon-info-color") ?? "#0000ff";
const alertIconColor = GlobalStyleVariables.get("--modal-icon-alert-color") ?? "#e98e2d";
const errorIconColor = GlobalStyleVariables.get("--modal-icon-error-color") ?? "#c50000";

const DEFAULT_DIALOG_ICONS = {
    promt: {
        method: "path",
        size: {
            width: 1000,
            height: 1000
        },
        content: promptIconPath,
        style: {
            color: promptIconColor,
            shadow: true
        }
    },
    confirm: {
        method: "path",
        size: {
            width: 1000,
            height: 1000
        },
        content: confirmIconPath,
        style: {
            color: confirmIconColor,
            shadow: true
        }
    },
    alert: {
        method: "path",
        size: {
            width: 1000,
            height: 1000
        },
        content: alertIconPath,
        style: {
            color: alertIconColor,
            shadow: true
        }
    },
    error: {
        method: "path",
        size: {
            width: 1000,
            height: 1000
        },
        content: errorIconPath,
        style: {
            color: errorIconColor,
            shadow: true
        }
    }
};

export default class ModalDialog extends Modal {

    static #dialogIcons = new Map();

    #onsubmit = null;

    #oncancel = null;

    #onclose = null;

    #textEl;

    #footerEl;

    #cancelEl;

    #submitEl;

    #initialFocusElement = null;

    constructor(options = {}) {
        super(options.caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#footerEl = this.shadowRoot.getElementById("footer");

        if (!!options.text && typeof options.text === "string") {
            this.#textEl = this.shadowRoot.getElementById("text");
            if (options.text instanceof HTMLElement) {
                this.#textEl.append(options.text);
            } else if (typeof options.text === "string") {
                this.#textEl.innerHTML = options.text;
            }
        }

        if (options.cancel) {
            this.#cancelEl = els.getElementById("cancel");
            if (options.cancel instanceof HTMLElement) {
                this.#cancelEl.text = undefined;
                this.#cancelEl.append(options.cancel);
            } else if (typeof options.cancel === "string") {
                this.#cancelEl.text = options.cancel;
            }
            this.registerTargetEventHandler(this.#cancelEl, "click", () => this.cancel());
            this.#footerEl.append(this.#cancelEl);
        }

        if (options.submit) {
            this.#submitEl = els.getElementById("submit");
            if (options.submit instanceof HTMLElement) {
                this.#submitEl.text = undefined;
                this.#submitEl.append(options.submit);
            } else if (typeof options.submit === "string") {
                this.#submitEl.text = options.submit;
            }
            this.registerTargetEventHandler(this.#submitEl, "click", () => this.submit());
            this.#footerEl.append(this.#submitEl);
        }
    }

    async show() {
        return new Promise((resolve) => {
            this.#onsubmit = function() {
                resolve(true);
            };
            this.#oncancel = function() {
                resolve(false);
            };
            this.#onclose = function() {
                resolve();
            };
            super.show();
        });
    }

    submit() {
        this.remove();
        if (this.#onsubmit) {
            this.#onsubmit();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("submit"));
    }

    cancel() {
        this.remove();
        if (this.#oncancel) {
            this.#oncancel();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("cancel"));
    }

    close() {
        this.remove();
        if (this.#onclose) {
            this.#onclose();
            this.#onsubmit = null;
            this.#oncancel = null;
            this.#onclose = null;
        }
        this.dispatchEvent(new Event("close"));
    }

    getSubmitValue() {
        return true;
    }

    static setDialogIcon(type, config) {
        this.#dialogIcons.set(type, config);
    }

    static #applyDialogIcon(dialogEl, type) {
        if (this.#dialogIcons.has(type)) {
            const iconConfig = this.#dialogIcons.get(type);
            if (dialogEl.setIcon(iconConfig)) {
                return;
            }
        }
        dialogEl.setIcon(DEFAULT_DIALOG_ICONS[type]);
    }

    static async alert(caption, text) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "ok"
        });
        this.#applyDialogIcon(dialogEl, "alert");
        dialogEl.initialFocusElement = dialogEl.#submitEl;
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async confirm(caption, text) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "yes",
            cancel: "no"
        });
        this.#applyDialogIcon(dialogEl, "confirm");
        dialogEl.initialFocusElement = dialogEl.#cancelEl;
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static async prompt(caption, text, value) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: true,
            cancel: true
        });
        this.#applyDialogIcon(dialogEl, "promt");
        // ---
        const inputEl = document.createElement("input");
        inputEl.className = "prompt-input";
        if (typeof value === "string") {
            inputEl.value = value;
        } else if (typeof value === "number") {
            inputEl.value = value.toString();
        }
        dialogEl.registerTargetEventHandler(inputEl, "keydown", (event) => {
            if (event.key == "Enter") {
                dialogEl.submit();
                event.stopPropagation();
            }
        });
        dialogEl.append(inputEl);
        dialogEl.initialFocusElement = inputEl;
        // ---
        const result = await dialogEl.show();
        return result && inputEl.value;
    }

    static async promptNumber(caption, text, value = 0, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: true,
            cancel: true
        });
        this.#applyDialogIcon(dialogEl, "promt");
        // ---
        const inputEl = document.createElement("input");
        inputEl.type = "number";
        inputEl.min = min;
        inputEl.max = max;
        inputEl.className = "prompt-input";
        if (typeof value === "number" && !isNaN(value)) {
            inputEl.value = value;
        }
        dialogEl.registerTargetEventHandler(inputEl, "keydown", (event) => {
            if (event.key == "Enter") {
                dialogEl.submit();
                event.stopPropagation();
            }
        });
        dialogEl.append(inputEl);
        dialogEl.initialFocusElement = inputEl;
        // ---
        const result = await dialogEl.show();
        return result && parseFloat(inputEl.value);
    }

    static async error(caption = "Error", text = "An error occured", errors = []) {
        const dialogEl = new ModalDialog({
            caption,
            text,
            submit: "ok"
        });
        dialogEl.streched = true;
        this.#applyDialogIcon(dialogEl, "error");
        // ---
        if (this.#hasErrors(errors)) {
            const inputEl = document.createElement("textarea");
            inputEl.style.flexShrink = "1";
            inputEl.style.flexGrow = "1";
            inputEl.style.minHeight = "100px";
            inputEl.style.maxHeight = "500px";
            inputEl.style.padding = "5px";
            inputEl.style.color = "black";
            inputEl.style.backgroundColor = "white";
            inputEl.style.border = "solid 1px black";
            inputEl.style.overflow = "auto";
            inputEl.style.whiteSpace = "pre";
            inputEl.style.resize = "none";
            inputEl.readOnly = true;
            inputEl.value = Array.isArray(errors) ? errors.join("\n") : errors.toString();
            inputEl.setSelectionRange(0, 0);
            dialogEl.append(inputEl);
            dialogEl.initialFocusElement = inputEl;
            setTimeout(() => {
                inputEl.style.height = `${inputEl.scrollHeight}px`;
            }, 0);
        }
        // ---
        const result = await dialogEl.show();
        return result;
    }

    static #hasErrors(errors) {
        if (Array.isArray(errors)) {
            errors.filter((err) => {
                return err instanceof Error || typeof err === "string";
            });
            return errors.length > 0;
        }
        return errors instanceof Error || typeof errors === "string";
    }

    initialFocus() {
        const presetEl = this.initialFocusElement;
        if (presetEl != null) {
            presetEl.focus();
        } else {
            super.initialFocus();
        }
    }

    set initialFocusElement(value) {
        if (value instanceof HTMLElement) {
            this.#initialFocusElement = value;
        } else {
            this.#initialFocusElement = null;
        }
    }

    get initialFocusElement() {
        return this.#initialFocusElement;
    }

}

customElements.define("emc-modal-dialog", ModalDialog);
