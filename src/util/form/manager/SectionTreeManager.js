import {deepClone} from "../../helper/DeepClone.js";
import {nodeOccurenceComparator} from "../../helper/ui/NodeListSort.js";

function deepCloneTreeConfig(value) {
    const result = {};
    for (const key in value) {
        const entry = value[key];
        const {
            connectedNode, children, ...rest
        } = entry;
        result[key] = {
            connectedNode,
            ...deepClone(rest)
        };
        if (children) {
            result[key].children = deepCloneTreeConfig(children);
        }
    }
    return result;
}

function escapeSectionId(label) {
    return label.toLowerCase().replace(/\s/g, "_");
}

export default class SectionTreeManager {

    #managedSectionEls = new Map();

    #treeConfig = {};

    addSection(section) {
        if (!this.#managedSectionEls.has(section)) {
            const id = escapeSectionId(section.label);
            const config = {
                label: section.label,
                sorted: false,
                selectOnClick: false,
                sortFunction: SectionTreeManager.#sortByOccurence,
                startCollapsed: true,
                connectedNode: section,
                onClick: SectionTreeManager.#onTreeNodeClick
            };
            this.#managedSectionEls.set(section, config);
            const parents = section.parentSectionElementList;
            if (parents.length > 0) {
                if (!this.#managedSectionEls.has(parents[0])) {
                    this.addSection(parents[0]);
                }
                const parentConfig = this.#managedSectionEls.get(parents[0]);
                parentConfig.children = parentConfig.children ?? {};
                config.path = [...parentConfig.path, id];
                parentConfig.children[id] = config;
            } else {
                this.#treeConfig[id] = config;
                config.path = [id];
            }
        }
    }

    removeSection(section) {
        if (this.#managedSectionEls.has(section)) {
            const id = escapeSectionId(section.label);
            this.#managedSectionEls.delete(section);
            const children = section.querySelectorAll("emc-form-section");
            for (const child of children) {
                if (this.#managedSectionEls.has(child)) {
                    this.removeSection(child);
                }
            }
            delete this.#treeConfig[id];
        }
    }

    get treeConfig() {
        return deepCloneTreeConfig(this.#treeConfig);
    }

    getPath(section) {
        if (this.#managedSectionEls.has(section)) {
            const config = this.#managedSectionEls.get(section);
            return [...config.path];
        }
    }

    static #sortByOccurence(entry0, entry1) {
        const {connectedNode: el0} = entry0;
        const {connectedNode: el1} = entry1;

        if (el0.parentElement !== el1.parentElement) {
            return nodeOccurenceComparator(el0, el1);
        }
    }

    static #onTreeNodeClick(event) {
        const targetNode = event.target;
        const connectedNode = targetNode.connectedNode;
        connectedNode.scrollIntoView();
        if (!targetNode.collapsed) {
            event.preventDefault();
        }
    }

}
