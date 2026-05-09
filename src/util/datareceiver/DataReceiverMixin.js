import {createMixin} from "../../mixin/Mixin.js";

export default createMixin((superclass) => class DataReceiverMixin extends superclass {

    // eslint-disable-next-line no-unused-vars
    setSortIndicators(columns = []) {}

    // eslint-disable-next-line no-unused-vars
    setData(data = []) {}

    busy() {}

    unbusy() {}

});
