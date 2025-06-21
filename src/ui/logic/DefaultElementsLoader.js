import "./elements/ComparatorEqual.js";
import "./elements/ComparatorGreaterThan.js";
import "./elements/ComparatorGreaterThanEqual.js";
import "./elements/ComparatorLessThan.js";
import "./elements/ComparatorLessThanEqual.js";
import "./elements/ComparatorNotEqual.js";
import "./elements/LiteralFalse.js";
// import "./elements/LiteralNumber.js";
import "./elements/LiteralState.js";
// import "./elements/LiteralString.js";
import "./elements/LiteralTrue.js";
import "./elements/LiteralValue.js";
import "./elements/MathAdd.js";
import "./elements/MathDiv.js";
import "./elements/MathMod.js";
import "./elements/MathMul.js";
import "./elements/MathPow.js";
import "./elements/MathSub.js";
import "./elements/OperatorAnd.js";
import "./elements/OperatorNand.js";
import "./elements/OperatorNor.js";
import "./elements/OperatorNot.js";
import "./elements/OperatorOr.js";
import "./elements/OperatorXnor.js";
import "./elements/OperatorXor.js";
import "./elements/RestrictorMax.js";
import "./elements/RestrictorMin.js";

// TODO add string input logic element
// TODO add number input logic element

export const DEFAULT_LOGIC_OPERATORS = [
    /* literals */
    "false", "true",
    /* operators */
    "not", "and", "nand", "or", "nor", "xor", "xnor",
    /* restrictors */
    "min", "max",
    /* comparators */
    "eq", "gt", "gte", "lt", "lte", "neq",
    /* math */
    "add", "sub", "mul", "div", "mod", "pow"
];
