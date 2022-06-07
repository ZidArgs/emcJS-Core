export default class EventBusAbstractModule {

    constructor() {
        if (new.target === EventBusAbstractModule) {
            throw new Error("can not construct abstract class");
        }
    }

    onModuleEvent(/* payload */) {
        // will be overwritten by EventBus
    }

    triggerModuleEvent(/* payload */) {
        throw new Error("can not call abstract method");
    }

}
