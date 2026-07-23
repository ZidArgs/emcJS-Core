import Vector2D from "../../data/Vector2D.js";

export default class TouchGestures extends EventTarget {

    #touchCache = new Map();

    touchStart(event) {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            this.#touchCache.set(touch.identifier, touch);
        }
    }

    touchMove(event) {
        event.preventDefault();
        if (event.changedTouches.length > 0) {
            this.#handlePan(event);
            this.#handlePinch(event);
            for (const touch of event.changedTouches) {
                this.#touchCache.set(touch.identifier, touch);
            }
        }
    }

    touchEnd(event) {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            this.#touchCache.delete(touch.identifier);
        }
    }

    #handlePan(event) {
        const [centerX, centerY] = this.#getTouchCenter(event);
        const [deltaX, deltaY] = this.#getTouchDelta(event);

        const ev = new Event("touchpan");
        ev.centerX = centerX;
        ev.centerY = centerY;
        ev.deltaX = deltaX;
        ev.deltaY = deltaY;
        ev.touchCount = event.targetTouches.length;
        this.dispatchEvent(ev);
    }

    #handlePinch(event) {
        if (event.targetTouches.length === 2) {
            const newPoint1 = event.targetTouches[0];
            const oldPoint1 = this.#touchCache.get(newPoint1.identifier);
            const oldVector1 = new Vector2D(oldPoint1.clientX, oldPoint1.clientY);
            const newVector1 = new Vector2D(newPoint1.clientX, newPoint1.clientY);

            const newPoint2 = event.targetTouches[1];
            const oldPoint2 = this.#touchCache.get(newPoint2.identifier);
            const oldVector2 = new Vector2D(oldPoint2.clientX, oldPoint2.clientY);
            const newVector2 = new Vector2D(newPoint2.clientX, newPoint2.clientY);

            const oldDistance = oldVector1.distanceTo(oldVector2);
            const newDistance = newVector1.distanceTo(newVector2);

            if (oldDistance !== newDistance) {
                const ev = new Event("touchpinch");
                ev.centerX = (newPoint1.clientX + newPoint2.clientX) / 2;
                ev.centerY = (newPoint1.clientY + newPoint2.clientY) / 2;
                ev.deltaDist = newDistance - oldDistance;
                this.dispatchEvent(ev);
            }
        }
    }

    #getTouchCenter(event) {
        const result = [0, 0];
        const count = event.targetTouches.length;
        for (const touch of event.targetTouches) {
            result[0] += touch.clientX;
            result[1] += touch.clientY;
        }
        return [result[0] / count, result[1] / count];
    }

    #getTouchDelta(event) {
        const result = [0, 0];
        const count = event.changedTouches.length;
        for (const touch of event.changedTouches) {
            const oldTouch = this.#touchCache.get(touch.identifier);
            result[0] += touch.clientX - oldTouch.clientX;
            result[1] += touch.clientY - oldTouch.clientY;
        }
        return [result[0] / count, result[1] / count];
    }

}
