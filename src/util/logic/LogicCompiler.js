const TRANSPILERS = {
    /* literals */
    "true":     () => "1",
    "false":    () => "0",
    "string":   (logic) => `${escapeString(logic.el)}`,
    "number":   (logic) => `${escapeNumber(logic.el)}`,
    "value":    (logic) => `(val(${escapeString(logic.el)})??0)`,
    "state":    (logic) => `(val(${escapeString(logic.el)})??0)==${escapeValue(logic.value)}`,

    /* operators */
    "and":      (logic) => `${multiElementOperation(logic.el, "&&")}`,
    "nand":     (logic) => `!${multiElementOperation(logic.el, "&&")}`,
    "or":       (logic) => `${multiElementOperation(logic.el, "||")}`,
    "nor":      (logic) => `!${multiElementOperation(logic.el, "||")}`,
    "not":      (logic) => `!(${buildLogic(logic.el)})`,
    "xor":      (logic) => `${twoElementOperation(logic.el, "^") || 1}`,
    "xnor":     (logic) => `!${twoElementOperation(logic.el, "^") || 1}`,

    /* restrictors */
    "min":      (logic) => `(${buildLogic(logic.el)}>=${escapeNumber(logic.value)})`,
    "max":      (logic) => `(${buildLogic(logic.el)}<=${escapeNumber(logic.value)})`,

    /* comparators */
    "eq":       (logic) => twoElementOperation(logic.el, "=="),
    "neq":      (logic) => twoElementOperation(logic.el, "!="),
    "lt":       (logic) => twoElementOperation(logic.el, "<"),
    "lte":      (logic) => twoElementOperation(logic.el, "<="),
    "gt":       (logic) => twoElementOperation(logic.el, ">"),
    "gte":      (logic) => twoElementOperation(logic.el, ">="),

    /* math */
    "add":      (logic) => mathMultiElementOperation(logic.el, "+"),
    "sub":      (logic) => mathMultiElementOperation(logic.el, "-"),
    "mul":      (logic) => mathMultiElementOperation(logic.el, "*"),
    "div":      (logic) => mathMultiElementOperation(logic.el, "/"),
    "mod":      (logic) => mathMultiElementOperation(logic.el, "%"),
    "pow":      (logic) => mathTwoElementOperation(logic.el, "**")
};

const dependencies = new Set();

/* STRINGS */
function escapeString(str) {
    if (typeof str != "string") {
        if (typeof str == "number" && !isNaN(str)) {
            return `"${str}"`;
        }
        return `""`;
    }
    const res = str.replace(/[\\"]/g, "\\$&");
    return `"${res}"`;
}

/* VALUE */
function escapeValue(str) {
    if (typeof str != "string") {
        if (typeof str == "number") {
            if (isNaN(str)) {
                return 0;
            }
            return str;
        }
        return 0;
    }
    const res = str.replace(/[\\"]/g, "\\$&");
    dependencies.add(res);
    return `"${res}"`;
}

/* ELEMENTS */
function twoElementOperation(els, join) {
    return mathMultiElementOperation(els.slice(0, 2), join);
}

function multiElementOperation(els, join) {
    if (els.length == 0) {
        return 0;
    }
    return `(${els.map(buildLogic).join(join)})`;
}

/* MATH */
function escapeNumber(val) {
    val = parseInt(val);
    if (!isNaN(val)) {
        return val;
    }
    return 0;
}

function toNumber(val) {
    return `(parseInt(${val})||0)`
}

function mathTwoElementOperation(els, join) {
    return mathMultiElementOperation(els.slice(0, 2), join);
}

function mathMultiElementOperation(els, join) {
    if (els.length == 0) {
        return 0;
    }
    return `${els.map(buildLogic).map(toNumber).join(join)}`;
}

/* INITIATOR */
function buildLogic(logic) {
    if (typeof logic != "object") {
        logic = {type: logic};
    }
    if (TRANSPILERS[logic.type] != null) {
        return TRANSPILERS[logic.type](logic);
    }
    return 0;
}

class LogicCompiler {

    compile(logic) {
        const buf = buildLogic(logic);
        const fn = new Function("val", `return ${buf}`);
        Object.defineProperty(fn, "requires", {value: dependencies});
        dependencies.clear();
        return fn;
    }

}

export default new LogicCompiler;
