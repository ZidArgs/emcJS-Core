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
