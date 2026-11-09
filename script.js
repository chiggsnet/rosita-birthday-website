/* =========================================
   ROSITA'S BIRTHDAY WEBSITE
   CELEBRATION NAVIGATION
========================================= */

const enterButton = document.getElementById("enterButton");

const celebrationSection = document.getElementById(
    "celebrationSection"
);

enterButton.addEventListener("click", () => {

    enterButton.disabled = true;

    enterButton.innerHTML = `
        <span>OPENING YOUR CELEBRATION...</span>
        <span class="arrow">✦</span>
    `;

    setTimeout(() => {

        celebrationSection.classList.add("show");
        document.getElementById("viewMemoriesSection").classList.add("show");

        celebrationSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        enterButton.disabled = false;

        enterButton.innerHTML = `
            <span>ENTER YOUR CELEBRATION</span>
            <span class="arrow">→</span>
        `;

    }, 700);

});