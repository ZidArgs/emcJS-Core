import "/emcJS/ui/form/button/Button.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";

const promptEl = document.getElementById("prompt");
const promptNumberEl = document.getElementById("prompt-number");
const promptSensitiveEl = document.getElementById("prompt-sensitive");
const confirmEl = document.getElementById("confirm");
const alertEl = document.getElementById("alert");
const errorEl = document.getElementById("error");

promptEl.addEventListener("click", async () => {
    const res = await ModalDialog.prompt("Prompt", "Enter something", "prefilled");
    if (typeof res === "string") {
        window.alert(res);
    }
});

promptNumberEl.addEventListener("click", async () => {
    const res = await ModalDialog.promptNumber("Prompt Number", "Your Age?", 18);
    if (typeof res === "number") {
        window.alert(res);
    }
});

promptSensitiveEl.addEventListener("click", async () => {
    const res = await ModalDialog.promptSensitive("Prompt", "Enter something secret", "i like trains");
    if (typeof res === "string") {
        window.alert(res);
    }
});

confirmEl.addEventListener("click", async () => {
    const res = await ModalDialog.confirm("Confirm", "Confirm this");
    if (res) {
        window.alert("confirmed");
    }
});

alertEl.addEventListener("click", () => {
    ModalDialog.alert("Alert", "Notice me, senpai!");
});

errorEl.addEventListener("click", async () => {
    ModalDialog.error("Error", "Something went wrong...", ["Your life :p"]);
});
