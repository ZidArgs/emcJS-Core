export default class ListSelectionHelper extends EventTarget {

    #target;

    #container;

    #skipFn;

    constructor(target, container, skipFn) {
        super();
        this.#target = target;
        this.#container = container;
        this.#skipFn = skipFn;
        /* --- */
        target.addEventListener("blur", (event) => {
            this.#cancelSelection();
            event.stopPropagation();
            return false;
        });
        target.addEventListener("keydown", (event) => {
            if (!("readonly" in target) || !target.readonly) {
                switch (event.key) {
                    case "Escape": {
                        this.#onEscape(event);
                    } break;
                    case "Enter": {
                        this.#onEnter(event);
                    } break;
                }
            }
        });
        target.addEventListener("keydown", (event) => {
            if (!("readonly" in target) || !target.readonly) {
                switch (event.key) {
                    case "ArrowUp": {
                        this.#onArrowUp(event);
                    } break;
                    case "ArrowDown": {
                        this.#onArrowDown(event);
                    } break;
                }
            }
        });
    }

    #cancelSelection() {
        const marked = this.#target.querySelector(".marked");
        if (marked != null) {
            marked.classList.remove("marked");
        }
    }

    #skipElement(el) {
        if (el.style.display === "none") {
            return true;
        }
        if (typeof this.#skipFn === "function") {
            return this.#skipFn(el);
        }
        return false;
    }

    #onEscape(event) {
        this.#cancelSelection();
        /* --- */
        event.stopPropagation();
        return false;
    }

    #onEnter(event) {
        const marked = this.#target.querySelector(".marked");
        if (marked != null) {
            const ev = new Event("choose");
            ev.value = marked.getAttribute("value");
            this.dispatchEvent(ev);
        }
        /* --- */
        event.stopPropagation();
        return false;
    }

    #onArrowUp(event) {
        const marked = this.#target.querySelector(".marked");
        if (marked != null) {
            let el = marked.previousElementSibling;
            while (el != null && this.#skipElement(el)) {
                el = el.previousElementSibling;
            }
            if (el != null) {
                marked.classList.remove("marked");
                el.classList.add("marked");
                const targetScroll = el.offsetTop - 20 - this.#container.offsetTop;
                if (this.#container.scrollTop > targetScroll) {
                    this.#container.scrollTop = targetScroll;
                }
            }
        } else {
            let el = this.#target.querySelector("[value]");
            while (el != null && this.#skipElement(el)) {
                el = el.nextElementSibling;
            }
            if (el != null) {
                el.classList.add("marked");
                this.#container.scrollTop = 0;
            }
        }
        event.stopPropagation();
        return false;
    }

    #onArrowDown(event) {
        const marked = this.#target.querySelector(".marked");
        if (marked != null) {
            let el = marked.nextElementSibling;
            while (el != null && this.#skipElement(el)) {
                el = el.nextElementSibling;
            }
            if (el != null) {
                marked.classList.remove("marked");
                el.classList.add("marked");
                const targetScroll = el.offsetTop - this.#container.clientHeight - this.#container.offsetTop + el.clientHeight + 20;
                if (this.#container.scrollTop < targetScroll) {
                    this.#container.scrollTop = targetScroll;
                }
            }
        } else {
            let el = this.#target.querySelector("[value]");
            while (el != null && this.#skipElement(el)) {
                el = el.nextElementSibling;
            }
            if (el != null) {
                el.classList.add("marked");
                this.#container.scrollTop = 0;
            }
        }
        event.stopPropagation();
        return false;
    }

}
