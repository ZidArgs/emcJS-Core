
const LOCALHOST_ALIASES = ["localhost", "127.0.0.1", "[::1]"];

const SECURE_PROTOCOLS = ["https", "wss"];

export const IS_LOCALHOST = isLocalhost(location.hostname);

export const IS_SECURE_PAGE = isSecureProtocol(location.protocol);

export function isLocalhost(hostname) {
    return LOCALHOST_ALIASES.includes(hostname);
}

export function isSecureProtocol(protocol) {
    return SECURE_PROTOCOLS.includes(protocol.replace(/:/g, ""));
}
