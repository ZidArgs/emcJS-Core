
const CANVAS = document.createElement("canvas");
const SERIALIZER = new XMLSerializer();

class Helper {

    randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
        max -= min;
        return parseInt(Math.random() * (max + 1)) + min;
    }

    compareVersions(a = "", b = "", s = ".") {
        const c = a.split(s);
        const d = b.split(s);
        let e = parseInt(c.shift());
        let f = parseInt(d.shift());
        while (!!e && !!f) {
            if (e != f) {
                return e < f;
            }
            e = parseInt(c.shift());
            f = parseInt(d.shift());
        }
        return !!f;
    }

    arrayDiff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => !c.has(d));
    }
      
    arraySymDiff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        return this.arrayDiff(a, b).concat(this.arrayDiff(b, a));
    }
    
    arrayIntersect(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => c.has(d));
    }
    
    objectSort(a, b) {
        if (typeof a != "object" || Array.isArray(a)) {
            throw new TypeError("only objects are sortable");
        }
        if (typeof b != "function") {
            b = undefined;
        }
        const c = {};
        const d = Object.keys(a).sort(b);
        for (const e of d) {
            c[e] = a[e];
        }
        return c;
    }
    
    isEqual(a, b) {
        if (Object.is(a, b)) {
            return true;
        }
        if (typeof a != "object") {
            return false;
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() == b.getTime();
        }
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length != b.length) {
                return false;
            }
            return a.every((i, j) => this.isEqual(i, b[j]));
        } else {
            if (Array.isArray(b)) {
                return false;
            }
            const c = Object.keys(a);
            if (c.length != Object.keys(b).length) {
                return false;
            }
            return c.every(i => b[i] != null && this.isEqual(a[i], b[i]));
        }
    }
    
    svg2png(svg) {
        return new Promise(function(resolve, reject) {
            if (!(svg instanceof SVGElement)) {
                reject(new TypeError("only svg elements can be converted to png"));
            }
            CANVAS.setAttribute("width", svg.getAttribute("width"));
            CANVAS.setAttribute("height", svg.getAttribute("height"));
            const url = 'data:image/svg+xml;base64,' + btoa(SERIALIZER.serializeToString(svg));
            const ctx = CANVAS.getContext("2d");
            const img = new Image();
            img.addEventListener("load", function() {
                ctx.drawImage(img, 0, 0);
                resolve(CANVAS.toDataURL("image/png"));
            });
            img.src = url;
        });
    }

    deepClone(item) {
        if (item != null && typeof item == "object") {
            if (item instanceof HTMLElement) {
                return item.cloneNode(true);
            }
            if (item instanceof Date) {
                return new Date(item);
            }
            if (item instanceof Boolean) {
                return Boolean(item);
            }
            if (item instanceof Number) {
                return Number(item);
            }
            if (item instanceof String) {
                return String(item);
            }
            if (Array.isArray(item)) {
                return item.map(el => this.deepClone(el));
            }
            const result = {};
            for (const i in item) {
                result[i] = this.deepClone(item[i]);
            }
            return result;
        }
        return item;
    }

}

export default new Helper;
