import FileLoader from "/emcJS/util/file/FileLoader.js";
import SettingsOverlay from "/emcJS/ui/settings/SettingsOverlay.js";
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";
import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import KeySequence from "/emcJS/util/keyboard/KeySequence.js";
import "/emcJS/ui/Page.js";
import SettingsConfigHandler from "./SettingsConfigHandler.js";

/* SETTINGS */
const settingsStorage = new ObservableStorage();

const openSettingsButtonEl = document.getElementById("open-settings");
const settingsOverlayEl = new SettingsOverlay();
settingsOverlayEl.caption = "Settings";
settingsOverlayEl.type = "modal";

openSettingsButtonEl.addEventListener("click", () => {
    const values = settingsStorage.getAll();
    settingsOverlayEl.setValuesFlat(values);
    settingsOverlayEl.show();
});

HotkeyHandler.setAction("open_settings", () => {
    const values = settingsStorage.getAll();
    settingsOverlayEl.setValuesFlat(values);
    settingsOverlayEl.show();
});

settingsOverlayEl.addEventListener("submit", (event) => {
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

settingsOverlayEl.addEventListener("cancel", () => {
    console.log("cancel");
});

/* OPTIONS */
const optionsStorage = new ObservableStorage();

const openOptionsButtonEl = document.getElementById("open-options");
const optionsOverlayEl = new SettingsOverlay();
optionsOverlayEl.caption = "Options";
optionsOverlayEl.type = "modal";

openOptionsButtonEl.addEventListener("click", () => {
    const values = optionsStorage.getAll();
    optionsOverlayEl.setValuesFlat(values);
    optionsOverlayEl.show();
});

optionsOverlayEl.addEventListener("submit", (event) => {
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
    optionsStorage.setAll(changes);
    optionsStorage.flushChanges();
});

optionsOverlayEl.addEventListener("cancel", () => {
    console.log("cancel");
});

/* INIT */
export async function init() {
    const [
        settings,
        options,
        locations
    ] = await Promise.all([
        FileLoader.json("/pages/settings-panel/settings.json"),
        FileLoader.json("/pages/settings-panel/options.json"),
        FileLoader.json("/pages/settings-panel/locations.json")
    ]);

    // SETTINGS
    const settingsConfigHandler = new SettingsConfigHandler(settings, (label) => `setting[${label}]`);
    window.settingsConfig = settingsConfigHandler;
    settingsOverlayEl.loadConfig(settingsConfigHandler.config, settingsConfigHandler.defaultValues);

    const languageOptionGroup = new OptionGroupRegistry("I18n.languages");
    languageOptionGroup.setAll({
        "de_de": "Deutsch",
        "en_us.easy": "English (Descriptive names)",
        "en_us": "English"
    });

    // OPTIONS
    const optionsConfigHandler = new SettingsConfigHandler(options, (label) => `option[${label}]`);
    window.optionsConfig = optionsConfigHandler;
    optionsOverlayEl.loadConfig(optionsConfigHandler.config, optionsConfigHandler.defaultValues);

    const LOCATION_NAMES = Object.keys(locations).reduce((res, value) => {
        res[`excluded_location[${value}]`] = `location[${value}]`;
        return res;
    }, {});
    const locationsOptionGroup = new OptionGroupRegistry("Locations.names");
    locationsOptionGroup.setAll(LOCATION_NAMES);
}

init();
