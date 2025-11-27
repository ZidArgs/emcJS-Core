
const keyboard = navigator.keyboard;
const keyboardLayoutMap = await keyboard?.getLayoutMap?.() ?? null;

export function resolveKey(code) {
    return normalizeKey(keyboardLayoutMap?.get(code) ?? code);
}

function normalizeKey(code) {
    code = code.toLowerCase();
    if (code.startsWith("key")) {
        return code.slice(3);
    }
    if (code.startsWith("numpad")) {
        return `num ${code.slice(6)}`;
    }
    return code;
}
