import "./sortinput/SortInput.js";

const sortInputEl = document.getElementById("sort-input");

sortInputEl.addEventListener("change", (event) => {
    console.log("change", event.oldValue, event.value);
});
