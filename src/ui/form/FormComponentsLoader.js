import "./element/select/token/TokenSelect.js";import MapLocker from "../../data/locker/MapLocker.js";

// structural
import FormSection from "./FormSection.js";
import FormFieldset from "./FormFieldset.js";
import FormRow from "./FormRow.js";

export const FORM_STRUCTURE_MAPPING = new MapLocker(new Map([
    ["Section", FormSection],
    ["Fieldset", FormFieldset],
    ["Row", FormRow]
]));

// button
import Button from "./button/Button.js";
import ActionButton from "./button/ActionButton.js";
import SubmitButton from "./button/SubmitButton.js";
import ResetButton from "./button/ResetButton.js";
import ErrorButton from "./button/ErrorButton.js";
import LinkButton from "./button/LinkButton.js";

export const FORM_BUTTON_MAPPING = new MapLocker(new Map([
    ["Button", Button],
    ["ActionButton", ActionButton],
    ["SubmitButton", SubmitButton],
    ["ResetButton", ResetButton],
    ["ErrorButton", ErrorButton],
    ["LinkButton", LinkButton]
]));

// element / input
import "./element/input/action/ActionInput.js";
import "./element/input/boolorlogic/BoolOrLogicInput.js";
import "./element/input/code/CodeInput.js";
import "./element/input/color/ColorInput.js";
import "./element/input/grid/GridInput.js";
import "./element/input/keybind/KeyBindInput.js";
import "./element/input/keyvaluelist/KeyValueListInput.js";
import "./element/input/list/ListInput.js";
import "./element/input/logic/LogicInput.js";
import "./element/input/number/NumberInput.js";
import "./element/input/password/PasswordInput.js";
import "./element/input/range/RangeInput.js";
import "./element/input/search/SearchInput.js";
import "./element/input/slider/SliderInput.js";
import "./element/input/string/StringInput.js";
import "./element/input/switch/SwitchInput.js";
import "./element/input/text/TextInput.js";
// element / select
import "./element/select/image/ImageSelect.js";
import "./element/select/list/ListSelect.js";
import "./element/select/relation/RelationSelect.js";
import "./element/select/search/SearchSelect.js";
import "./element/select/simple/SimpleSelect.js";
import "./element/select/switch/SwitchSelect.js";

