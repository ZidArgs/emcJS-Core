export function instanceOfOne(obj, ...classList) {
    if (Array.isArray(classList[0])) {
        classList = classList[0];
    }
    for (const clazz of classList) {
        if (obj instanceof clazz) {
            return true;
        }
    }
    return false;
}

export function allInstanceOf(clazz = Object, ...objList) {
    if (objList.length == 1 && Array.isArray(objList[0])) {
        objList = objList[0];
    }
    for (const obj of objList) {
        if (!(obj instanceof clazz)) {
            return false;
        }
    }
    return true;
}

export function isClass(obj) {
    if (obj == null) {
        return false;
    }
    const isClass = isClassDefinition(obj);
    if (obj.prototype == null) {
        return isClass;
    }
    const isProtoClass = isClassDefinition(obj.prototype);
    return isClass || isProtoClass;
}

function isClassDefinition(obj) {
    return obj.constructor?.toString().slice(0, 5) === "class";
}
