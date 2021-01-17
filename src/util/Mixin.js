class MixinBuilder {

    constructor(superclass) {
        this.superclass = superclass;
    }

    with(...mixins) {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }

}

class Mixin {

    mix(superclass) {
        return new MixinBuilder(superclass);
    }
    
    registerMixin(mixin) {
        const typeTag = Symbol('isa');
        const _mixin = (target) => {
            const ext = mixin(target);
            Object.defineProperty(ext.prototype, typeTag, { value: true });
            return ext;
        };
        Object.defineProperty(_mixin, Symbol.hasInstance, {
            value: (i) => !!i[typeTag]
        });
        return _mixin;
    }

}

const MixinInstance = new Mixin();

export default MixinInstance;

export const mix = MixinInstance.mix;
export const registerMixin = MixinInstance.registerMixin;
