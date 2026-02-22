import Enum from "../data/Enum.js";

export default class Axes2D extends Enum {

    static NONE = new this("none");

    static VERTICAL = new this("vertical");

    static HORIZONTAL = new this("horizontal");

    static BOTH = new this("both");

}
