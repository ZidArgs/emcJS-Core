import {
    isNull, isNumberNotNaN
} from "../util/helper/CheckType.js";

/**
 * A class to represent 2D coordinates with some quality of life methods for vector calculations.
 */
export default class Vector2D {

    #x;

    #y;

    #length;

    #angle;

    #aspectRatio;

    constructor(x, y) {
        if (!isNumberNotNaN(x)) {
            throw new TypeError("x has to be a valid number");
        }
        if (!isNumberNotNaN(y)) {
            throw new TypeError("y has to be a valid number");
        }
        this.#x = x;
        this.#y = y;
    }

    /**
     * Compares the current {@link Vector2D} with another {@link Vector2D} or an Array with exactly 2 numbers.
     *
     * @param {Vector2D | [number, number]} vector the {@link Vector2D} or Array to compare to
     * @returns `true` if the given parameter resembles the current {@link Vector2D}, `false` otherwise
     */
    equals(vector) {
        if (isNull(vector)) {
            return false;
        }
        if (Array.isArray(vector)) {
            if (vector.length !== 2) {
                return false;
            }
            return this.#x === vector[0] && this.#y === vector[1];
        }
        if (!(vector instanceof Vector2D)) {
            return false;
        }
        return this.#x === vector.x && this.#y === vector.y;
    }

    clone() {
        return new Vector2D(this.#x, this.#y);
    }

    toJSON() {
        return [this.#x, this.#y];
    }

    toString() {
        return `Vector2D[${this.#x},${this.#y}]`;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get length() {
        if (isNull(this.#length)) {
            this.#length = (this.#x ** 2 + this.#y ** 2) ** 0.5;
        }
        return this.#length;
    }

    get angle() {
        if (isNull(this.#angle)) {
            this.#angle = (Math.atan2(this.#y, this.#x) * (180 / Math.PI) + 360) % 360;
        }
        return this.#angle;
    }

    get isNormalized() {
        return this.#length === 1;
    }

    get aspectRatio() {
        if (isNull(this.#aspectRatio)) {
            this.#aspectRatio = this.#y === 0 ? 0 : this.#x / this.#y;
        }
        return this.#aspectRatio;
    }

    /**
     * Adds the given {@link Vector2D} to the current one and returns a new {@link Vector2D} with the result.
     *
     * @param {Vector2D} vector the {@link Vector2D} to add
     * @returns a new {@link Vector2D}
     */
    add(vector) {
        if (!(vector instanceof Vector2D)) {
            throw new TypeError("vector has to be an instance of Vector2D");
        }
        const newX = this.#x + vector.x;
        const newY = this.#y + vector.y;
        return new Vector2D(newX, newY);
    }

    /**
     * Subtracts the given {@link Vector2D} from the current one and returns a new {@link Vector2D} with the result.
     *
     * @param {Vector2D} vector the {@link Vector2D} to substract
     * @returns a new {@link Vector2D}
     */
    sub(vector) {
        if (!(vector instanceof Vector2D)) {
            throw new TypeError("vector has to be an instance of Vector2D");
        }
        const newX = this.#x - vector.x;
        const newY = this.#y - vector.y;
        return new Vector2D(newX, newY);
    }

    /**
     * Returns a new {@link Vector2D} with each Axis being absolute (positive).
     *
     * @returns a new {@link Vector2D}
     */
    abs() {
        const newX = this.#x > 0 ? this.#x : -this.#x;
        const newY = this.#y > 0 ? this.#y : -this.#y;
        return new Vector2D(newX, newY);
    }

    /**
     * Returns a new {@link Vector2D} with each Axis representing the direction of the current {@link Vector2D}.
     *
     * `1` for greater than zero, `-1` for less than zero, otherwise `0`.
     *
     * @returns a new {@link Vector2D}
     */
    dir() {
        const newX = this.#x > 0 ? 1 : this.#x < 0 ? -1 : 0;
        const newY = this.#y > 0 ? 1 : this.#y < 0 ? -1 : 0;
        return new Vector2D(newX, newY);
    }

    /**
     * Calculates the {@link Vector2D} with a length of 1 pointing in the same direction.
     *
     * @returns a normalized {@link Vector2D}
     */
    normalize() {
        if (this.#length === 0) {
            return new Vector2D(0, 0);
        }
        const newX = this.#x / this.#length;
        const newY = this.#y / this.#length;
        return new Vector2D(newX, newY);
    }

    /**
     * Rotate the current {@link Vector2D} by the given amount and return the result as a new {@link Vector2D}.
     *
     * @param {number} degrees the angle in degrees
     * @returns a rotated {@link Vector2D}
     */
    rotate(degrees) {
        if (!isNumberNotNaN(degrees)) {
            throw new TypeError("degrees has to be a valid number");
        }
        const angle = -degrees * (Math.PI / 180);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.#x * cos - this.#y * sin;
        const newY = this.#x * sin + this.#y * cos;
        return new Vector2D(newX, newY);
    }

    /**
     * Calculates the angle from a given {@link Vector2D} to the current one.
     * The result ranges from -180 to 180.
     *
     * @param {Vector2D} vector the {@link Vector2D} from which to calculate the angle
     * @returns the signed angle
     */
    angleFrom(vector) {
        if (!(vector instanceof Vector2D)) {
            throw new TypeError("vector has to be an instance of Vector2D");
        }
        const angleDiff = this.#angle - vector.angle;
        return (angleDiff + 180) % 360 - 180;
    }

    /**
     * Calculates the distance between the current {@link Vector2D} and a given one.
     *
     * The distance is the length of a vector between the endpoints of two vectors.
     *
     * @param {Vector2D} vector the {@link Vector2D} to calculate the distance to
     * @returns the distance between the vector endpoints
     */
    distanceTo(vector) {
        if (!(vector instanceof Vector2D)) {
            throw new TypeError("vector has to be an instance of Vector2D");
        }
        const newX = this.#x - vector.x;
        const newY = this.#y - vector.y;
        return (newX ** 2 + newY ** 2) ** 0.5;
    }

    /**
     * Create a new {@link Vector2D} with the given length.
     * If the current length is zero, the new {@link Vector2D} will point in the direction of the postive x-axis.
     *
     * @param {number} length the length of the new {@link Vector2D}
     * @returns a new {@link Vector2D}
     */
    toLength(length) {
        if (!isNumberNotNaN(length)) {
            throw new TypeError("length has to be a valid number");
        }
        if (this.#length === 0) {
            return new Vector2D(length, 0);
        }
        const newX = this.#x / this.#length * length;
        const newY = this.#y / this.#length * length;
        return new Vector2D(newX, newY);
    }

    /**
     * Create a new {@link Vector2D} with a given length or the length of 1 rotated by the given degrees.
     *
     * @param {number} degrees the angle in degrees
     * @param {number?} length the optional length for the new {@link Vector2D}, defaults to 1
     * @returns a new {@link Vector2D}
     */
    static fromAngle(degrees, length) {
        if (!isNumberNotNaN(degrees)) {
            throw new TypeError("degrees has to be a valid number");
        }
        length = parseFloat(length);
        if (isNaN(length)) {
            length = 1;
        }
        const angle = -degrees * (Math.PI / 180);
        const newX = Math.cos(angle) * length;
        const newY = Math.sin(angle) * length;
        return new Vector2D(newX, newY);
    }

}
