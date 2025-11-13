import {deepClone} from "../../helper/DeepClone.js";

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

export default class SectionTreeManager {

    #managedSectionEls = new Map();

    #treeConfig = {};

    addSection(section) {
        if (!this.#managedSectionEls.has(section)) {
            const id = section.label.toLowerCase().replace(/\s/g, "-");
            const config = {
                label: section.label,
                sorted: false,
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
                parentConfig.children[id] = config;
            } else {
                this.#treeConfig[id] = config;
            }
        }
    }

    get treeConfig() {
        return deepCloneTreeConfig(this.#treeConfig);
    }

    static #sortByOccurence(entry0, entry1) {
        const {connectedNode: el0} = entry0;
        const {connectedNode: el1} = entry1;

        if (el0.parentElement !== el1.parentElement) {
            const comparedPosition = el0.compareDocumentPosition(el1);
            if (comparedPosition & Node.DOCUMENT_POSITION_FOLLOWING) {
                return 1;
            } else {
                return -1;
            }
        }
    }

    static #onTreeNodeClick(event) {
        event.preventDefault();
        const targetNode = event.target;
        const connectedNode = targetNode.connectedNode;
        connectedNode.scrollIntoView();
    }

}
