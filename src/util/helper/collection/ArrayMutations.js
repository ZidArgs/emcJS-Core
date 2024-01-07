export function moveInArray(array, from, to) {
    return array.splice(to, 0, array.splice(from, 1)[0]), array;
}

export function moveInArrayImmuted(array, from, to) {
    const newArray = array.toSpliced(from, 1);
    return newArray.splice(to, 0, array[from]), newArray;
}

export function deleteAtIndex(array, index) {
    return array.splice(index, 1), array;
}

export function deleteAtIndexImmuted(array, index) {
    return array.toSpliced(index, 1);
}

export function insertAtIndex(array, index, value) {
    return array.splice(index, 0, value), array;
}

export function insertAtIndexImmuted(array, index, value) {
    return array.toSpliced(index, 0, value);
}

// analytical functions
export function getArrayMutations(a, b) {
    const {sequences, maxLength} = getArrayMutationSequence(a, b);

    const changeMap = {
        changes: {},
        deleted: []
    };

    for (const eA of a) {
        if (b.indexOf(eA) < 0) {
            changeMap.deleted.push(eA);
        }
    }

    const bB = [...sequences];

    if (bB[0].oldStart === bB[0].newStart) {
        bB.splice(0, 1);
    }
    const toRemove = bB.findIndex((e) => {
        return e.oldStart >= 0 && e.length === maxLength;
    });
    if (toRemove >= 0) {
        bB.splice(toRemove, 1);
    }

    while (bB.length) {
        const {sequence, newStart} = bB.shift();
        let offset = newStart;
        for (const eB of sequence) {
            changeMap.changes[offset++] = eB;
        }
    }

    return changeMap;
}

export function getArrayMutationSequence(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new TypeError("only arrays are comparable");
    }
    if (a.length !== (new Set(a)).size || b.length !== (new Set(b)).size) {
        throw new TypeError("arrays need to have unique values");
    }
    const bA = [...a].filter((eA) => {
        if (b.indexOf(eA) < 0) {
            return false;
        }
        return true;
    });
    const res = {
        sequences: [],
        maxLength: 0
    };
    let offset = 0;
    while (offset < b.length) {
        const s = extractArraySequences(bA, b, offset);
        const seqLength = s.length;
        if (res.maxLength < seqLength) {
            res.maxLength = seqLength;
        }
        const iBA = bA.indexOf(s[0]);
        if (iBA >= 0) {
            bA.splice(iBA, seqLength);
        }
        const iA = a.indexOf(s[0]);
        res.sequences.push({
            sequence: s,
            oldStart: iA,
            newStart: offset,
            length: seqLength
        });
        offset += seqLength;
    }

    return mergeArraySequences(res);
}

function extractArraySequences(a, b, s) {
    let as = a.indexOf(b[s]);
    const res = [];
    if (as < 0) {
        while (as < 0 && s < b.length) {
            res.push(b[s]);
            s++;
            as = a.indexOf(b[s]);
        }
    } else {
        while (as < a.length && s < b.length && a[as] === b[s]) {
            res.push(b[s]);
            as++;
            s++;
        }
    }
    return res;
}

function mergeArraySequences(data) {
    const res = {
        sequences: [],
        maxLength: 0
    };
    data.sequences.sort((a0, a1) => {
        if (a0.oldStart === -1 && a1.oldStart > -1) {
            return 1;
        }
        if (a0.oldStart > -1 && a1.oldStart === -1) {
            return -1;
        }
        if (a0.newStart < a1.newStart) {
            return -1;
        }
        if (a0.newStart > a1.newStart) {
            return 1;
        }
        return 0;
    });
    let nStart = 0;
    let oStart = 0;
    let currentStart = -1;
    let descend = true;
    let currentSequence;
    for (const seq of data.sequences) {
        const {sequence, oldStart, newStart} = seq;
        const descended = newStart < oldStart;
        if (currentSequence != null && oldStart > 0 && newStart > currentStart && descend === descended) {
            currentStart = newStart;
            currentSequence = [
                ...currentSequence,
                ...sequence
            ]
        } else {
            if (currentSequence != null) {
                const seqLength = currentSequence.length;
                res.sequences.push({
                    sequence: currentSequence,
                    oldStart: oStart,
                    newStart: nStart,
                    length: seqLength
                });
                if (res.maxLength < seqLength) {
                    res.maxLength = seqLength;
                }
            }
            nStart = newStart;
            oStart = oldStart;
            currentStart = newStart;
            currentSequence = sequence;
            descend = newStart < oldStart;
        }
    }
    if (currentSequence.length > 0) {
        const seqLength = currentSequence.length;
        res.sequences.push({
            sequence: currentSequence,
            oldStart: oStart,
            newStart: nStart,
            length: seqLength
        });
        if (res.maxLength < seqLength) {
            res.maxLength = seqLength;
        }
    }
    return res;
}
