const NUMBER_STRING_REGEX = /^([0-9]+)(.*?)([0-9]+)$/;
const NUMBER_PREFIX_STRING_REGEX = /^([0-9]+)(.*?)/;
const NUMBER_POSTFIX_STRING_REGEX = /(.*?)([0-9]+)$/;

export function numberSurroundedStringComparator(a, b) {
    const fullCompare = a.localeCompare(b);
    if (fullCompare !== 0) {
        const rA = NUMBER_STRING_REGEX.exec(a);
        const rB = NUMBER_STRING_REGEX.exec(b);
        if (rA != null && rB != null) {
            const [, nA0, sA, nA1] = rA;
            const [, nB0, sB, nB1] = rB;
            const iA0 = parseInt(nA0);
            const iB0 = parseInt(nB0);

            const nCompare = iA0 - iB0;
            if (nCompare !== 0) {
                return nCompare;
            }
            const sCompare = sA.localeCompare(sB);
            if (sCompare !== 0) {
                return sCompare;
            }
            const iA1 = parseInt(nA1);
            const iB1 = parseInt(nB1);
            return iA1 - iB1;
        }
    }
    return fullCompare;
}

export function numberPrefixedStringComparator(a, b) {
    const fullCompare = a.localeCompare(b);
    if (fullCompare !== 0) {
        const rA = NUMBER_PREFIX_STRING_REGEX.exec(a);
        const rB = NUMBER_PREFIX_STRING_REGEX.exec(b);
        if (rA != null && rB != null) {
            const [, sA, nA] = rA;
            const [, sB, nB] = rB;
            const iA = parseInt(nA);
            const iB = parseInt(nB);
            const nCompare = iA - iB;
            if (nCompare !== 0) {
                return nCompare;
            }
            return sA.localeCompare(sB);
        }
    }
    return fullCompare;
}

export function numberPostfixedStringComparator(a, b) {
    const fullCompare = a.localeCompare(b);
    if (fullCompare !== 0) {
        const rA = NUMBER_POSTFIX_STRING_REGEX.exec(a);
        const rB = NUMBER_POSTFIX_STRING_REGEX.exec(b);
        if (rA != null && rB != null) {
            const [, sA, nA] = rA;
            const [, sB, nB] = rB;
            const sCompare = sA.localeCompare(sB);
            if (sCompare !== 0) {
                return sCompare;
            }
            const iA = parseInt(nA);
            const iB = parseInt(nB);
            return iA - iB;
        }
    }
    return fullCompare;
}
