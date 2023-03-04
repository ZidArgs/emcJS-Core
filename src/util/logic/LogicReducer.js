function filterNull(input) {
    return input != null;
}

function filterTrue(input) {
    return input.type != "true";
}

function filterFalse(input) {
    return input.type != "false";
}

export function reduceLogic(input) {
    switch (input?.type) {
        case "and": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull).filter(filterTrue)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el.some((e) => e.type == "false")) {
                return {type: "false"}
            }
            return output;
        }
        case "nand": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull).filter(filterTrue)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el.some((e) => e.type == "false")) {
                return {type: "true"}
            }
            return output;
        }
        case "or": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull).filter(filterFalse)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el.some((e) => e.type == "true")) {
                return {type: "true"}
            }
            return output;
        }
        case "nor": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull).filter(filterFalse)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el.some((e) => e.type == "true")) {
                return {type: "false"}
            }
            return output;
        }
        case "xor": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el[0].type == "true" && output.el[1].type == "true" || output.el[0].type == "false" && output.el[1].type == "false") {
                return {type: "false"}
            }
            if (output.el[0].type == "false" && output.el[1].type == "true" || output.el[0].type == "true" && output.el[1].type == "false") {
                return {type: "true"}
            }
            return output;
        }
        case "xnor": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            if (output.el[0].type == "true" && output.el[1].type == "true" || output.el[0].type == "false" && output.el[1].type == "false") {
                return {type: "true"}
            }
            if (output.el[0].type == "false" && output.el[1].type == "true" || output.el[0].type == "true" && output.el[1].type == "false") {
                return {type: "false"}
            }
            return output;
        }
        case "add":
        case "sub":
        case "mul":
        case "div":
        case "mod":
        case "pow":
        case "eq":
        case "neq":
        case "gt":
        case "gte":
        case "lt":
        case "lte": {
            const output = {
                type: input.type,
                el: input.el.map(reduceLogic).filter(filterNull)
            };
            if (output.el.length == 0) {
                return;
            }
            if (output.el.length == 1) {
                return output.el[0];
            }
            return output;
        }
        case "min":
        case "max": {
            const output = {
                type: input.type,
                el: reduceLogic(input.el),
                value: input.value
            };
            if (output.el == null) {
                return;
            }
            return output;
        }
        case "not": {
            const output = {
                "type": "not",
                "el": reduceLogic(input.el)
            }
            if (output.el == null) {
                return;
            }
            if (output.el.type == "false") {
                return {type: "true"}
            }
            if (output.el.type == "true") {
                return {type: "false"}
            }
            if (output.el.type == "not") {
                return output.el.el
            }
            return output;
        }
        default: {
            return input;
        }
    }
}
