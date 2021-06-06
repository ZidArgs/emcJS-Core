const FILES = new Map();
let active = false;

class AudioContextManager {

    add(name) {
        const audio = new Audio(name);
        FILES.set(name, audio);
        if (active) {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(audioCtx.destination);
        }
    }

    activate() {
        active = true;
        for (const [, audio] of FILES.entries()) {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(audioCtx.destination);
        }
    }

    play(name) {
        const audio = FILES.get(name);
        audio.play();
    }

    get(name) {
        return FILES.get(name);
    }

}

export default new AudioContextManager();
