import {sleep} from "../../process/Sleep.js";

export async function waitForConnect(node) {
    while (!node.isConnected) {
        await sleep(10);
    }
    return node;
}
