export function instanceOfOne(obj, ...classList) {
    classList = classList.flat(Infinity);
    return classList.some((clazz) => obj instanceof clazz);
}

export function allInstanceOf(clazz = Object, ...objList) {
    return objList.every((obj) => obj instanceof clazz);
}

export function isClass(clazz = Object) {
    if (clazz == null) {
        return false;
    }
    const isClass = isClassDefinition(clazz);
    if (clazz.prototype == null) {
        return isClass;
    }
    const isProtoClass = isClassDefinition(clazz.prototype);
    return isClass || isProtoClass;
}

function isClassDefinition(clazz) {
    return clazz.constructor?.toString().slice(0, 5) === "class";
}

export function classExtends(clazzA = Object, clazzB = Object) {
    if (!isClass(clazzA) || !isClass(clazzB)) {
        return false;
    }
    return clazzA.prototype instanceof clazzB;
}
