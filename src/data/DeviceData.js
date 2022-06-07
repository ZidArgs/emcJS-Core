import {
    immute
} from "./Immutable.js";

const REQUEST_OS_DATA = ["platform", "platformVersion"];

function getOSData() {
    return new Promise((resolve) => {
        navigator.userAgentData.getHighEntropyValues(REQUEST_OS_DATA).then(resolve);
    });
}

const data = {
    vendor: navigator.vendor,
    userAgent: navigator.userAgent
};
if (navigator.userAgentData != null) {
    const uaData = navigator.userAgentData;
    data.platform = await getOSData();
    data.application = {
        mobile: uaData.mobile,
        brands: uaData.brands
    };
}

export default immute(data);
