import NavBar from "../ui/NavBar.js";
import Paging from "../ui/Paging.js";

const NAVBAR = new WeakMap();
const PAGING = new WeakMap();
const NAVIGATION = new Map();

export default class ViewSwitcher {

    constructor(navbar, paging) {
        if (!(navbar instanceof NavBar)) {
            throw new TypeError("parameter 1 expected to be of type NavBar");
        }
        if (!(paging instanceof Paging)) {
            throw new TypeError("parameter 2 expected to be of type Paging");
        }
        NAVBAR.set(this, navbar);
        PAGING.set(this, paging);
    }

    static register(name, config) {
        NAVIGATION.set(name, config);
    }

    switch(name) {
        const navbar = NAVBAR.get(this);
        const paging = PAGING.get(this);
        paging.active = name;
        if (NAVIGATION.has(name)) {
            navbar.loadNavigation(NAVIGATION.get(name));
        } else {
            navbar.loadNavigation([]);
        }
    }

}
