import FileLoader from "/emcJS/util/file/FileLoader.js";
import "/emcJS/ui/Page.js";
import SettingsPanel from "/emcJS/ui/settings/SettingsPanel.js";
import {translateSettings} from "./SettingsTranslator.js";
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";
import HotkeyHandler from "../../emcJS/util/HotkeyHandler.js";
import {extractDefaultValuesFromConfig} from "/emcJS/util/helper/ui/Form.js";
import KeySequence from "/emcJS/util/keyboard/KeySequence.js";

const settingsStorage = new ObservableStorage();

const openSettingsButtonEl = document.getElementById("open-settings");
const settingsPanelEl = new SettingsPanel();
settingsPanelEl.caption = "Settings";
settingsPanelEl.type = "modal";

openSettingsButtonEl.addEventListener("click", () => {
    const values = settingsStorage.getAll();
    settingsPanelEl.setValuesFlat(values);
    settingsPanelEl.show();
});

HotkeyHandler.setAction("open_settings", () => {
    const values = settingsStorage.getAll();
    settingsPanelEl.setValuesFlat(values);
    settingsPanelEl.show();
});

settingsPanelEl.addEventListener("submit", (event) => {
    const {
        errors, data, formData, hiddenData, changes
    } = event;
    console.group(`submit`);
    console.log("[E] errors", errors);
    console.log("[E] data", data);
    console.log("[E] formData", formData);
    console.log("[E] hiddenData", hiddenData);
    console.log("[E] changes", changes);
    console.groupEnd(`submit`);
    settingsStorage.setAll(changes);
    settingsStorage.flushChanges();

    if ("keybinds.hk_settings" in changes) {
        HotkeyHandler.setConfig("open_settings", KeySequence.parse(changes["keybinds.hk_settings"]));
    }
});

settingsPanelEl.addEventListener("cancel", () => {
    console.log("cancel");
});

export async function init() {
    const [settings] = await Promise.all([
        FileLoader.json("/pages/settings-panel/settings.json")
    ]);

    const settingsConfig = translateSettings(settings);
    settingsPanelEl.loadConfig(settingsConfig);

    const defaults = extractDefaultValuesFromConfig(settingsConfig);
    settingsStorage.deserialize(defaults);

    const keybindEl = settingsPanelEl.shadowRoot.getElementById("keybind-test");
    keybindEl.addEventListener("input", () => {
        console.log("input", keybindEl.value);
    });
    keybindEl.addEventListener("change", () => {
        console.log("change", keybindEl.value);
    });
}

init();
