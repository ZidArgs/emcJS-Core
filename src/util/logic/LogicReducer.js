function filterNull(input) {
    return input != null;
}

function filterTrue(input) {
    return input.type === "true";
}

function filterNoTrue(input) {
    return input.type !== "true";
}

function filterFalse(input) {
    return input.type === "false";
}

function filterNoFalse(input) {
    return input.type !== "false";
}

export function reduceLogic(input) {
    switch (input?.type) {
        case "and": {
            if (input.content.every(filterTrue)) {
                return {type: "true"};
            }
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterNoTrue)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content.some(filterFalse)) {
                return {type: "false"};
            }
            return output;
        }
        case "nand": {
            if (input.content.every(filterTrue)) {
                return {type: "false"};
            }
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterNoTrue)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type === "false")) {
                return {type: "true"};
            }
            return output;
        }
        case "or": {
            if (input.content.every(filterFalse)) {
                return {type: "false"};
            }
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterNoFalse)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type === "true")) {
                return {type: "true"};
            }
            return output;
        }
        case "nor": {
            if (input.content.every(filterFalse)) {
                return {type: "true"};
            }
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull).filter(filterNoFalse)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content.some((e) => e.type === "true")) {
                return {type: "false"};
            }
            return output;
        }
        case "xor": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content[0].type === "true" && output.content[1].type === "true" || output.content[0].type === "false" && output.content[1].type === "false") {
                return {type: "false"};
            }
            if (output.content[0].type === "false" && output.content[1].type === "true" || output.content[0].type === "true" && output.content[1].type === "false") {
                return {type: "true"};
            }
            return output;
        }
        case "xnor": {
            const output = {
                type: input.type,
                content: input.content.map(reduceLogic).filter(filterNull)
            };
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
                return output.content[0];
            }
            if (output.content[0].type === "true" && output.content[1].type === "true" || output.content[0].type === "false" && output.content[1].type === "false") {
                return {type: "true"};
            }
            if (output.content[0].type === "false" && output.content[1].type === "true" || output.content[0].type === "true" && output.content[1].type === "false") {
                return {type: "false"};
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
            if (output.content.length === 0) {
                return;
            }
            if (output.content.length === 1) {
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
            };
            if (output.content == null) {
                return;
            }
            if (output.content.type === "false") {
                return {type: "true"};
            }
            if (output.content.type === "true") {
                return {type: "false"};
            }
            if (output.content.type === "not") {
                return output.content.content;
            }
            return output;
        }
        default: {
            return input;
        }
    }
}
