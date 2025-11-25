import FileLoader from "/emcJS/util/file/FileLoader.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/settings/SettingsPanel.js";
import {translateSettings} from "./SettingsTranslator.js";

const settingsPanelEl = document.getElementById("settings-panel");

settingsPanelEl.addEventListener("submit", (event) => {
    const {
        data, changes
    } = event;
    console.group(`submit`);
    console.log("[E] data", data);
    console.log("[E] changes", changes);
    console.groupEnd(`submit`);
});

settingsPanelEl.addEventListener("cancel", () => {
    console.log("cancel");
});

export async function init() {
    const [settings] = await Promise.all([
        FileLoader.json("/pages/settings-panel/settings.json")
    ]);

    settingsPanelEl.loadConfig(translateSettings(settings));
}

init();
