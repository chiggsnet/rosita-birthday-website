const balloonScenes = document.querySelectorAll("[data-floating-balloons]");
const balloonStyles = [
    { size: 44, left: "9%", color: "blue", delay: "-8s", resting: "18%" },
    { size: 58, left: "32%", color: "silver", delay: "-19s", resting: "46%" },
    { size: 40, left: "66%", color: "blue", delay: "-13s", resting: "72%" },
    { size: 64, left: "86%", color: "silver", delay: "-27s", resting: "28%" }
];

balloonScenes.forEach((scene) => {
    const layer = document.createElement("div");
    layer.className = "floating-balloons";
    layer.setAttribute("aria-hidden", "true");

    balloonStyles.forEach((balloon, index) => {
        const flight = document.createElement("div");
        flight.className = "balloon-flight";
        flight.style.setProperty("--balloon-left", balloon.left);
        flight.style.setProperty("--balloon-size", `${balloon.size}px`);
        flight.style.setProperty("--balloon-height", `${Math.round(balloon.size * 1.24)}px`);
        flight.style.setProperty("--balloon-string", `${Math.round(balloon.size * 0.7)}px`);
        flight.style.setProperty("--balloon-duration", `${34 + index * 5}s`);
        flight.style.setProperty("--sway-duration", `${7 + index * 1.5}s`);
        flight.style.setProperty("--balloon-delay", balloon.delay);
        flight.style.setProperty("--balloon-resting-top", balloon.resting);

        const shape = document.createElement("div");
        shape.className = `balloon balloon-${balloon.color}`;

        const drift = document.createElement("div");
        drift.className = "balloon-drift";

        const highlight = document.createElement("span");
        highlight.className = "balloon-highlight";

        shape.append(highlight);
        drift.append(shape);
        flight.append(drift);
        layer.append(flight);
    });

    scene.prepend(layer);
});
