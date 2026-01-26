import {isStringNotEmpty} from "../../util/helper/CheckType.js";
import Modal from "../../ui/modal/Modal.js";

class ModalRegistry {

    #registry = new Map();

    register(name, modal) {
        if (!isStringNotEmpty(name)) {
            throw new TypeError("name has to be a non empty string");
        }
        if (!(modal instanceof Modal)) {
            throw new TypeError("modal has to be an instance of Modal");
        }
        this.#registry.set(name, modal);
    }

    show(name, ...params) {
        const modal = this.#registry.get(name);
        if (modal) {
            modal.show(...params);
        }
    }

}

const modalRegistry = new ModalRegistry();

export default modalRegistry;
