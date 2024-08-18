export function moveInArray(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
    return array;
}

export function moveInArrayImmuted(array, from, to) {
    const newArray = array.toSpliced(from, 1);
    return newArray.splice(to, 0, array[from]), newArray;
}

export function deleteAtIndex(array, index) {
    array.splice(index, 1);
    return array;
}

export function deleteAtIndexImmuted(array, index) {
    return array.toSpliced(index, 1);
}

export function insertAtIndex(array, index, value) {
    array.splice(index, 0, value);
    return array;
}

export function insertAtIndexImmuted(array, index, value) {
    return array.toSpliced(index, 0, value);
}

export function filterInPlace(array, cond) {
    if (typeof cond === "function") {
        for (let i = array.length - 1; i >= 0; i -= 1) {
            if (!cond(array[i])) {
                array.splice(i, 1);
            }
        }
    }
}

// analytical functions
export function getArrayMutations(a, b) {
    const sequenceData = getArrayMutationSequence(a, b);

    const {sequences, maxLength} = sequenceData;

    const changeMap = {
        changes: [],
        deleted: []
    };

    for (const eA of a) {
        if (b.indexOf(eA) < 0) {
            changeMap.deleted.push(eA);
        }
    }

    const bB = [...sequences];

    const toRemove = bB.findIndex((e) => {
        return e.oldStart >= 0 && e.length === maxLength;
    });
    if (toRemove >= 0) {
        bB.splice(toRemove, 1);
    }

    for (const seq of bB) {
        const {sequence, newStart} = seq;
        changeMap.changes.push({sequence, position: newStart});
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
        maxLength: 0,
        ascending: 0,
        descending: 0
    };

    let newStart = 0;
    while (newStart < b.length) {
        const s = extractMutationArraySequences(bA, b, newStart);
        const seqLength = s.length;
        if (res.maxLength < seqLength) {
            res.maxLength = seqLength;
        }
        const iA = a.indexOf(s[0]);
        const movedBy = newStart - iA;
        res.sequences.push({
            sequence: s,
            oldStart: iA,
            newStart,
            movedBy,
            length: seqLength
        });
        if (movedBy > 0) {
            res.ascending += seqLength;
        } else if (movedBy < 0) {
            res.descending += seqLength;
        }
        newStart += seqLength;
    }

    return mergeArrayMutationSequences(res);
}

function extractMutationArraySequences(a, b, s) {
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

function mergeArrayMutationSequences(data) {
    const res = {
        sequences: [],
        maxLength: 0,
        ascending: data.ascending,
        descending: data.descending
    };

    const generalMovementUp = data.ascending > data.descending;

    data.sequences.sort((a0, a1) => {
        if (a0.oldStart === -1 && a1.oldStart > -1) {
            return 1;
        }
        if (a0.oldStart > -1 && a1.oldStart === -1) {
            return -1;
        }
        if (generalMovementUp) {
            if (a0.movedBy < 0 && a1.movedBy >= 0) {
                return -1;
            }
            if (a0.movedBy >= 0 && a1.movedBy < 0) {
                return 1;
            }
            if (a0.newStart < a1.newStart) {
                return -1;
            }
            if (a0.newStart > a1.newStart) {
                return 1;
            }
        } else {
            if (a0.movedBy <= 0 && a1.movedBy > 0) {
                return -1;
            }
            if (a0.movedBy > 0 && a1.movedBy <= 0) {
                return 1;
            }
            if (a0.newStart > a1.newStart) {
                return -1;
            }
            if (a0.newStart < a1.newStart) {
                return 1;
            }
        }
        return 0;
    });

    let nStart;
    let oStart;
    let currentNewStart = generalMovementUp ? -1 : Number.MAX_SAFE_INTEGER;
    let currentOldStart = generalMovementUp ? -1 : Number.MAX_SAFE_INTEGER;
    let generalMovementSequence = [];
    const newElements = [];

    for (const seq of data.sequences) {
        const {sequence, oldStart, newStart, movedBy} = seq;

        if (oldStart < 0) {
            newElements.push(seq);
        } else {
            const followsGeneralDirection = generalMovementUp ? movedBy >= 0 : movedBy <= 0;
            const followsAfterLatest = generalMovementUp ? newStart > currentNewStart : newStart < currentNewStart;
            const didFollowAfterLatest = generalMovementSequence.length === 0 || (generalMovementUp ? oldStart > currentOldStart : oldStart < currentOldStart);

            if (followsGeneralDirection && didFollowAfterLatest && followsAfterLatest) {
                if (nStart == null) {
                    nStart = newStart;
                    oStart = oldStart;
                }

                currentNewStart = newStart;
                currentOldStart = oldStart;

                if (generalMovementUp) {
                    generalMovementSequence = [
                        ...generalMovementSequence,
                        ...sequence
                    ];
                } else {
                    generalMovementSequence = [
                        ...sequence,
                        ...generalMovementSequence
                    ];
                }
            } else {
                const seqLength = sequence.length;

                const last = res.sequences.at(-1);
                if (last != null) {
                    if (generalMovementUp) {
                        if (newStart === last.newStart + last.length) {
                            last.sequence = [
                                ...last.sequence,
                                ...sequence
                            ];
                            last.length += seqLength;

                            if (res.maxLength < last.length) {
                                res.maxLength = last.length;
                            }
                            continue;
                        }
                    } else if (newStart === last.newStart - seqLength) {
                        last.sequence = [
                            ...sequence,
                            ...last.sequence
                        ];
                        last.newStart = newStart;
                        last.length += seqLength;

                        if (res.maxLength < last.length) {
                            res.maxLength = last.length;
                        }
                        continue;
                    }
                }

                res.sequences.push({
                    sequence: sequence,
                    oldStart,
                    newStart,
                    length: seqLength
                });

                if (res.maxLength < seqLength) {
                    res.maxLength = seqLength;
                }
            }
        }
    }

    if (generalMovementSequence.length > 0) {
        const seqLength = generalMovementSequence.length;
        res.sequences.push({
            sequence: generalMovementSequence,
            oldStart: oStart,
            newStart: nStart,
            length: seqLength
        });
        if (res.maxLength < seqLength) {
            res.maxLength = seqLength;
        }
    }

    while (newElements.length) {
        const seq = newElements.shift();
        const {sequence, newStart} = seq;
        const currentSequence = [...sequence];
        let currentOffset = newStart + 1;
        while (newElements.length) {
            const nSeq = newElements[0];
            const {sequence: nextSequence, newStart: nextStart} = nSeq;
            if (nextStart === currentOffset++) {
                currentSequence.push(...nextSequence);
                newElements.shift();
            } else {
                break;
            }
        }
        const seqLength = currentSequence.length;
        res.sequences.push({
            sequence: currentSequence,
            oldStart: -1,
            newStart,
            length: seqLength
        });
        if (res.maxLength < seqLength) {
            res.maxLength = seqLength;
        }
    }

    res.sequences.sort((a0, a1) => {
        if (a0.newStart < a1.newStart) {
            return -1;
        }
        if (a0.newStart > a1.newStart) {
            return 1;
        }
        return 0;
    });

    return res;
}
