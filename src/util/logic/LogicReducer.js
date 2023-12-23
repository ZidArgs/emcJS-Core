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
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterTrue)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type == "false")) {
                return {type: "false"}
            }
            return output;
        }
        case "nand": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterTrue)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type == "false")) {
                return {type: "true"}
            }
            return output;
        }
        case "or": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterFalse)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type == "true")) {
                return {type: "true"}
            }
            return output;
        }
        case "nor": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterFalse)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type == "true")) {
                return {type: "false"}
            }
            return output;
        }
        case "xor": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content[0].type == "true" && output.content[1].type == "true" || output.content[0].type == "false" && output.content[1].type == "false") {
                return {type: "false"}
            }
            if (output.content[0].type == "false" && output.content[1].type == "true" || output.content[0].type == "true" && output.content[1].type == "false") {
                return {type: "true"}
            }
            return output;
        }
        case "xnor": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            if (output.content[0].type == "true" && output.content[1].type == "true" || output.content[0].type == "false" && output.content[1].type == "false") {
                return {type: "true"}
            }
            if (output.content[0].type == "false" && output.content[1].type == "true" || output.content[0].type == "true" && output.content[1].type == "false") {
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
                content: input.content.map(reduceLogic).filter(filterNull)
            };
            if (output.content.length == 0) {
                return;
            }
            if (output.content.length == 1) {
                return output.content[0];
            }
            return output;
        }
        case "min":
        case "max": {
            const output = {
                type: input.type,
                content: reduceLogic(input.content),
                value: input.value
            };
            if (output.content == null) {
                return;
            }
            return output;
        }
        case "not": {
            const output = {
                "type": "not",
                "content": reduceLogic(input.content)
            }
            if (output.content == null) {
                return;
            }
            if (output.content.type == "false") {
                return {type: "true"}
            }
            if (output.content.type == "true") {
                return {type: "false"}
            }
            if (output.content.type == "not") {
                return output.content.content
            }
            return output;
        }
        default: {
            return input;
        }
    }
}
