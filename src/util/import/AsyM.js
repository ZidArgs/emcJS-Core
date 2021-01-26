const GENERATOR = new WeakMap();

async function extractModule(module) {
    if (module.default instanceof AsyM) {
        try {
            const asyM = await GENERATOR.get(module.default);
            const {default: def, ...other} = asyM ?? {};
            return [def, other];
        } catch(err) {
            throw new Error(`Error extracting async module\n${err}`)
        }
    }
    try {
        const {default: def, ...other} = module ?? {};
        return [def, other];
    } catch(err) {
        throw new Error(`Error extracting module\n${err}`)
    }
}

async function importAsyM(url) {
    return import(url)
        .then(extractModule)
        .catch(err => {throw new Error(`Error appending module "${url}" ${err}`)});
}

export default class AsyM {

    constructor(generator) {
        if (typeof generator != "function") {
            throw new TypeError(`generator must be of type "function" but is "${typeof generator}"`);
        }
        GENERATOR.set(this, generator());
    }

    static async import(url) {
        if (Array.isArray(url)) {
            const res = [];
            for (const i of url) {
                res.push(importAsyM(i));
            }
            return await Promise.all(res);
        } else {
            return await importAsyM(url);
        }
    }

}
