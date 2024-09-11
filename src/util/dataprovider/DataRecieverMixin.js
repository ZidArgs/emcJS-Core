import {
    createMixin
} from "../Mixin.js";

export default createMixin((superclass) => class DataRecieverMixin extends superclass {

    // eslint-disable-next-line no-unused-vars
    setSortIndicators(columns = []) {}

    // eslint-disable-next-line no-unused-vars
    setData(data = []) {}

    busy() {}

    unbusy() {}

    reset() {}

});
