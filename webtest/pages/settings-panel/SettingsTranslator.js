export function translateSettings(config) {
    const sectionMap = new Map();
    const translatedConfig = [];

    for (const [key, value] of Object.entries(config)) {
        const path = key.split(".");
        /* const inputName =  */path.pop();
        const sectionName = path.join(".");
        const sectionConfig = getOrCreateSection(translatedConfig, sectionMap, sectionName);
        const {
            options, ...attr
        } = value;
        if (options == null) {
            sectionConfig.children.push({
                label: key,
                name: key,
                ...attr
            });
        } else {
            sectionConfig.children.push({
                label: key,
                name: key,
                options: translateInputOptions(options),
                ...attr
            });
        }
    }

    return translatedConfig;
}

function getOrCreateSection(translatedConfig, sectionMap, sectionName) {
    if (sectionMap.has(sectionName)) {
        return sectionMap.get(sectionName);
    }
    const newSection = {
        type: "Section",
        label: sectionName,
        children: []
    };
    const path = sectionName.split(".");
    if (path.length > 1) {
        /* const currentName =  */path.pop();
        const parentName = path.join(".");
        const parentSection = getOrCreateSection(translatedConfig, sectionMap, parentName);

        parentSection.children.push(newSection);
        sectionMap.set(sectionName, newSection);
        return newSection;
    }
    sectionMap.set(sectionName, newSection);
    translatedConfig.push(newSection);
    return newSection;
}

function translateInputOptions(options) {
    if (Array.isArray(options)) {
        const res = {};
        for (const entry of options) {
            res[entry] = entry;
        }
        return res;
    }
    return options;
}
