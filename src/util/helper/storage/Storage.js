/**
 * Request the storage of the origin to be "persistent".
 *
 * @returns `true` if the storage storage is set to "persistent"
 */
export async function requestStoragePersist() {
    if (navigator.storage && navigator.storage.persist) {
        return await navigator.storage.persist();
    }
    return false;
}

/**
 * Checks if the storage of the origin is "persistent".
 *
 * @returns `true` if the storage storage is set to "persistent"
 */
export async function isStoragePersisted() {
    if (navigator.storage && navigator.storage.persist) {
        return await navigator.storage.persisted();
    }
    return false;
}

/**
 * Returns how much space is presumably available and how much is used.
 *
 * @returns `{usage, quota}` an object containing the usage and the quota of the storage
 */
export async function getStorageUsage() {
    return await navigator.storage.estimate();
}
