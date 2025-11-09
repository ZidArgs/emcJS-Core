import {deepClone} from "../../helper/DeepClone.js";

export default class SectionTreeManager {

    #managedSectionEls = new Map();

    #treeConfig = {};

    addSection(section) {
        if (!this.#managedSectionEls.has(section)) {
            const id = section.label.toLowerCase().replace(/\s/g, "-");
            const config = {
                label: section.label,
                sorted: false,
                startCollapsed: true
            };
            this.#managedSectionEls.set(section, config);
            const parents = section.parentSectionElementList;
            if (parents.length > 0) {
                if (!this.#managedSectionEls.has(parents[0])) {
                    this.addSection(parents[0]);
                }
                const parentConfig = this.#managedSectionEls.get(parents[0]);
                parentConfig.children = parentConfig.children ?? {};
                parentConfig.children[id] = config;
            } else {
                this.#treeConfig[id] = config;
            }
        }
    }

    get treeConfig() {
        return deepClone(this.#treeConfig);
    }

}
