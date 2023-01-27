export default class ElementListCache {

    #elementList = [];

    setNodeList(list) {
        this.#elementList = list.filter((el) => el instanceof Element);
    }

    get first() {
        return this.#elementList[0];
    }

    get last() {
        return this.#elementList.at(-1);
    }

    getNodeList() {
        return [...this.#elementList];
    }

    querySelector(selector) {
        for (const el of this.#elementList) {
            if (el.matches(selector)) {
                return el;
            }
        }
    }

    querySelectorAll(selector) {
        return [...this.#elementList].filter((el) => el.matches(selector))
    }

    get length() {
        return this.#elementList.length;
    }

    getPrev(element) {
        const pos = this.#elementList.indexOf(element);
        if (pos > 0) {
            return this.#elementList[pos - 1];
        }
    }

    getNext(element) {
        const pos = this.#elementList.indexOf(element);
        if (pos >= 0 && pos < this.#elementList.length - 1) {
            return this.#elementList[pos + 1];
        }
    }

    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.#elementList.length) {
                    return {value: this.#elementList[index++], done: false};
                } else {
                    return {done: true};
                }
            }
        }
    }

}
