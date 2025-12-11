export function getMinLevenshteinDistanceValue(targetValue, compareValues) {
    const valueCosts = {};
    for (const compareValue of compareValues) {
        valueCosts[compareValue] = calculateLevenshteinDistance(targetValue, compareValue);
    }
    let minCost = Number.MAX_SAFE_INTEGER;
    let result = targetValue;
    for (const value in valueCosts) {
        if (minCost > valueCosts[value]) {
            minCost = valueCosts[value];
            result = value;
        }
    }
    return result;
}

export function calculateLevenshteinDistance(source, target) {
    if (source.length < target.length) {
        return calculateDistance(target, source);
    }
    return calculateDistance(source, target);
}

function calculateDistance(source, target) {
    const sourceLength = source.length;
    const targetLength = target.length;

    const resultMatrix = new Array();
    resultMatrix[0] = new Array();

    for (let c = 0; c < targetLength + 1; c++) {
        resultMatrix[0][c] = c;
    }

    for (let i = 1; i < sourceLength + 1; i++) {
        resultMatrix[i] = new Array();
        resultMatrix[i][0] = i;
        for (let j = 1; j < targetLength + 1; j++) {
            const realCost = source.charAt(i - 1) == target.charAt(j - 1) ? 0 : 1;
            resultMatrix[i][j] = Math.min(resultMatrix[i - 1][j] + 1,
                resultMatrix[i][j - 1] + 1,
                resultMatrix[i - 1][j - 1] + realCost);
        }
    }

    return resultMatrix[sourceLength][targetLength];
}
