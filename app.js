// Year element to give dynamic year
const year = document.querySelector("#year");

const dt = new Date();

// Will insert dynamic year to the DOM
year.insertAdjacentHTML("beforeend", `${dt.getFullYear()}`);
