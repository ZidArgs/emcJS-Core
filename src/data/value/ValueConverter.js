const scalarToValueConverter = new Map();
const valueToScalarConverter = new Map();

export function registerValueConverter(type, scalarToValue, valueToScalar) {
    if (typeof type !== "string" || type === "") {
        throw new TypeError("ref must be a non empty string");
    }
    if (typeof scalarToValue !== "function") {
        throw new TypeError("scalarToValue must be a function or undefined");
    }
    if (typeof valueToScalar !== "function") {
        throw new TypeError("valueToScalar must be a function or undefined");
    }
    scalarToValueConverter.set(type, scalarToValue);
    valueToScalarConverter.set(type, valueToScalar);
    return this;
}

export function scalarToValue(ref, value) {
    if (typeof ref === "string" && ref !== "") {
        const fn = scalarToValueConverter.get(ref);
        if (fn != null) {
            return fn(value);
        }
    }
    return value;
}

export function valueToScalar(ref, value) {
    if (typeof ref === "string" && ref !== "") {
        const fn = valueToScalarConverter.get(ref);
        if (fn != null) {
            return fn(value);
        }
    }
    return value;
}

registerValueConverter("string",
    (value) => value.toString(),
    (value) => value.toString());

registerValueConverter("number",
    (value) => {
        const number = parseFloat(value);
        if (isNaN(number)) {
            return Number.NaN;
        }
        return number;
    },
    (value) => {
        const number = parseFloat(value);
        if (isNaN(number)) {
            return Number.NaN;
        }
        return number;
    });

registerValueConverter("integer",
    (value) => {
        const number = parseInt(value);
        if (isNaN(number)) {
            return Number.NaN;
        }
        return number;
    },
    (value) => {
        const number = parseInt(value);
        if (isNaN(number)) {
            return Number.NaN;
        }
        return number;
    });

registerValueConverter("boolean",
    (value) => !!value,
    (value) => !!value);

registerValueConverter("date",
    (value) => value.toISOString(),
    (value) => new Date(value));
