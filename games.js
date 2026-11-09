// =========================================
// FIREBASE — ROSITA'S BIRTHDAY WISHES
// =========================================

import {
    db,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot
} from "./firebase.js";
const startGameButton = document.getElementById("startGameButton");
const continueGameButton = document.getElementById("continueGameButton");
const celebrateRositaButton = document.getElementById("celebrateRositaButton");
const restartGameButton = document.getElementById("restartGameButton");
const restartAfterCelebrationButton = document.getElementById("restartAfterCelebrationButton");
const appreciationIntro = document.getElementById("appreciationIntro");
const appreciationChoices = document.getElementById("appreciationChoices");
const balloonStage = document.getElementById("balloonStage");
const balloonHeading = document.getElementById("balloonHeading");
const balloonScene = document.getElementById("balloonScene");
const balloonConfetti = document.getElementById("balloonConfetti");
const catchBalloonContainer = document.getElementById("catchBalloonContainer");
const balloonTapHint = document.getElementById("balloonTapHint");
const appreciationResult = document.getElementById("appreciationResult");
const appreciationFinish = document.getElementById("appreciationFinish");
const qualityOptions = Array.from(document.querySelectorAll(".quality-option"));
const selectedQualities = document.getElementById("selectedQualities");
const selectionHint = document.getElementById("selectionHint");
const wishIntro = document.getElementById("wishIntro");
const writeWishButton = document.getElementById("writeWishButton");
const wishForm = document.getElementById("wishForm");
const wishName = document.getElementById("wishName");
const wishMessage = document.getElementById("wishMessage");
const characterCount = document.getElementById("characterCount");
const wishFormError = document.getElementById("wishFormError");
const wishConfirmation = document.getElementById("wishConfirmation");
const submittedWish = document.getElementById("submittedWish");
const submittedWishName = document.getElementById("submittedWishName");
const wishDeliveryNotice = document.getElementById("wishDeliveryNotice");
const writeAnotherWishButton = document.getElementById("writeAnotherWishButton");
// Birthday Wishes Wall
const wishesWallStatus = document.getElementById("wishesWallStatus");
const wishesList = document.getElementById("wishesList");
const loadMoreWishesButton = document.getElementById("loadMoreWishesButton");

const balloonStagePlaceholder = document.createComment("Appreciation balloon stage");
balloonStage.parentNode.insertBefore(balloonStagePlaceholder, balloonStage);

const selectedQualityNames = new Set();
const balloonTimers = new Set();
const balloonFlightTimers = new Map();
const BALLOON_FLIGHT_DURATION = 4200;
const MAX_ACTIVE_BALLOONS = 3;
const REQUIRED_BALLOON_CATCHES = 6;
const BALLOON_LANES = [19, 50, 81];
const activeCatchBalloons = new Set();
let caughtBalloonCount = 0;
let catchGameComplete = false;
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

reducedMotionQuery.addEventListener("change", (event) => {
    reducedMotion = event.matches;
});

function scheduleBalloonAction(action, delay) {
    const timer = window.setTimeout(() => {
        balloonTimers.delete(timer);
        action();
    }, delay);

    balloonTimers.add(timer);
    return timer;
}

function clearBalloonTimers() {
    balloonTimers.forEach((timer) => window.clearTimeout(timer));
    balloonTimers.clear();
    balloonFlightTimers.clear();
}

function clearBalloonFlightTimer(balloon) {
    const timer = balloonFlightTimers.get(balloon);
    if (timer === undefined) return;

    window.clearTimeout(timer);
    balloonTimers.delete(timer);
    balloonFlightTimers.delete(balloon);
}

function restoreBalloonStage() {
    if (balloonStage.parentNode !== balloonStagePlaceholder.parentNode) {
        balloonStagePlaceholder.parentNode.insertBefore(balloonStage, balloonStagePlaceholder);
    }
    document.body.classList.remove("catch-balloon-game-open");
}

function resetAppreciationGame() {
    clearBalloonTimers();
    restoreBalloonStage();
    activeCatchBalloons.clear();
    caughtBalloonCount = 0;
    catchGameComplete = false;
    selectedQualityNames.clear();
    qualityOptions.forEach((option) => option.setAttribute("aria-pressed", "false"));
    selectedQualities.replaceChildren();
    balloonConfetti.replaceChildren();
    catchBalloonContainer.replaceChildren();
    balloonTapHint.textContent = "Catch six silver balloons to reveal the surprise.";
    selectionHint.textContent = "Select at least one quality to continue.";
    continueGameButton.disabled = true;
    appreciationIntro.hidden = false;
    appreciationChoices.hidden = true;
    balloonStage.hidden = true;
    appreciationResult.hidden = true;
    appreciationFinish.hidden = true;
}

function updateSelectedQualities() {
    const selected = qualityOptions.filter((option) =>
        selectedQualityNames.has(option.dataset.quality)
    );

    selectedQualities.replaceChildren(
        ...selected.map((option) => {
            const item = document.createElement("li");
            item.textContent = option.dataset.quality;
            return item;
        })
    );

    continueGameButton.disabled = selected.length === 0;
    selectionHint.textContent = selected.length
        ? `${selected.length} ${selected.length === 1 ? "quality" : "qualities"} selected.`
        : "Select at least one quality to continue.";
}

function scatterSilverConfetti(balloon) {
    const pieceCount = reducedMotion ? 8 : 24;
    const sceneBounds = balloonScene.getBoundingClientRect();
    const balloonBounds = balloon.getBoundingClientRect();
    const burstX = balloonBounds.left + balloonBounds.width / 2 - sceneBounds.left;
    const burstY = balloonBounds.top + balloonBounds.height / 2 - sceneBounds.top;

    for (let index = 0; index < pieceCount; index += 1) {
        const piece = document.createElement("span");
        const angle = (Math.PI * 2 * index) / pieceCount;
        const distance = 42 + (index % 4) * 14;
        const horizontalDistance = Math.cos(angle) * distance;
        const verticalDistance = Math.sin(angle) * distance;

        piece.className = "balloon-confetti-piece";
        piece.style.setProperty("--burst-x", `${burstX}px`);
        piece.style.setProperty("--burst-y", `${burstY}px`);
        piece.style.setProperty("--confetti-x", `${horizontalDistance}px`);
        piece.style.setProperty("--confetti-y", `${verticalDistance}px`);
        piece.style.setProperty("--confetti-rotate", `${index * 47}deg`);
        balloonConfetti.append(piece);
    }
}

function createCatchBalloon() {
    const balloon = document.createElement("button");
    balloon.type = "button";
    balloon.className = "catch-balloon";
    balloon.setAttribute("aria-label", "Catch the silver balloon");

    const art = document.createElement("span");
    art.className = "catch-balloon-art";
    art.setAttribute("aria-hidden", "true");

    const body = document.createElement("span");
    body.className = "catch-balloon-body";

    const highlight = document.createElement("span");
    highlight.className = "catch-balloon-highlight";

    const knot = document.createElement("span");
    knot.className = "catch-balloon-knot";

    const string = document.createElement("span");
    string.className = "catch-balloon-string";

    body.append(highlight);
    art.append(body, knot, string);
    balloon.append(art);
    return balloon;
}

function scheduleBalloonMiss(balloon, delay) {
    const timer = scheduleBalloonAction(() => {
        balloonFlightTimers.delete(balloon);
        missCatchBalloon(balloon);
    }, delay);
    balloonFlightTimers.set(balloon, timer);
}

function maintainCatchBalloons() {
    if (balloonStage.hidden || catchGameComplete || caughtBalloonCount >= REQUIRED_BALLOON_CATCHES) return;

    const occupiedLanes = new Set(
        Array.from(activeCatchBalloons, (balloon) => balloon.dataset.lane)
    );
    const availableLanes = BALLOON_LANES.filter((lane) => !occupiedLanes.has(String(lane)));

    while (activeCatchBalloons.size < MAX_ACTIVE_BALLOONS && availableLanes.length) {
        const lane = availableLanes.shift();
        const balloon = createCatchBalloon();
        balloon.dataset.lane = String(lane);
        balloon.style.setProperty("--balloon-lane", `${lane}%`);
        activeCatchBalloons.add(balloon);
        catchBalloonContainer.append(balloon);
        balloon.addEventListener("click", () => catchSilverBalloon(balloon));
        scheduleBalloonMiss(
            balloon,
            reducedMotion ? 9000 : BALLOON_FLIGHT_DURATION
        );
    }

    balloonTapHint.textContent =
        `${caughtBalloonCount} of ${REQUIRED_BALLOON_CATCHES} caught — catch the silver balloons!`;
}

function missCatchBalloon(balloon) {
    if (!activeCatchBalloons.has(balloon) || catchGameComplete) return;

    activeCatchBalloons.delete(balloon);
    balloon.disabled = true;
    balloon.remove();
    balloonTapHint.textContent = "One floated away! More silver balloons are on their way...";
    scheduleBalloonAction(maintainCatchBalloons, 650);
}

function catchSilverBalloon(balloon) {
    if (!activeCatchBalloons.has(balloon) || balloon.disabled || catchGameComplete) return;

    clearBalloonFlightTimer(balloon);
    activeCatchBalloons.delete(balloon);
    balloon.disabled = true;

    const sceneBounds = balloonScene.getBoundingClientRect();
    const balloonBounds = balloon.getBoundingClientRect();
    balloon.style.left = `${balloonBounds.left + balloonBounds.width / 2 - sceneBounds.left}px`;
    balloon.style.top = `${balloonBounds.top - sceneBounds.top}px`;
    balloon.classList.add("is-catching");
    caughtBalloonCount += 1;
    balloonTapHint.textContent = caughtBalloonCount >= REQUIRED_BALLOON_CATCHES
        ? "You caught them all! Your surprise is here..."
        : `${caughtBalloonCount} of ${REQUIRED_BALLOON_CATCHES} caught — keep going!`;
    balloon.classList.add("is-popping");
    scatterSilverConfetti(balloon);

    if (caughtBalloonCount < REQUIRED_BALLOON_CATCHES) {
        scheduleBalloonAction(() => balloon.remove(), reducedMotion ? 0 : 420);
        scheduleBalloonAction(maintainCatchBalloons, 500);
        return;
    }

    catchGameComplete = true;
    clearBalloonTimers();
    activeCatchBalloons.forEach((remainingBalloon) => {
        remainingBalloon.disabled = true;
        remainingBalloon.remove();
    });
    activeCatchBalloons.clear();

    scheduleBalloonAction(() => balloon.remove(), reducedMotion ? 0 : 420);
    scheduleBalloonAction(() => {
        restoreBalloonStage();
        balloonStage.hidden = true;
        appreciationResult.hidden = false;
        appreciationResult.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
        celebrateRositaButton.focus({ preventScroll: true });
    }, reducedMotion ? 100 : 850);
}

// =========================================
// BIRTHDAY WISHES — FIRESTORE SYSTEM
// =========================================

function setWishStorageNotice(message) {
    wishDeliveryNotice.textContent = message;
}

function showWishConfirmation(name, wish, storageMessage) {
    submittedWish.textContent = wish;

    submittedWishName.textContent = name
        ? `WITH LOVE, ${name}`
        : "WITH LOVE";

    wishForm.hidden = true;
    wishIntro.hidden = true;
    wishConfirmation.hidden = false;

    setWishStorageNotice(storageMessage);
}

// Display wishes safely on the public wall
function displayBirthdayWishes(snapshot) {
    wishesList.replaceChildren();

    if (snapshot.empty) {
        wishesWallStatus.textContent =
            "Rosita's wishes wall is waiting for its first beautiful message.";

        return;
    }

    wishesWallStatus.textContent =
        `${snapshot.size} beautiful ${snapshot.size === 1 ? "wish" : "wishes"} shared with Rosita.`;

    snapshot.forEach((wishDocument) => {
        const wish = wishDocument.data();

        const card = document.createElement("article");
        card.className = "wish-wall-card";

        const ornament = document.createElement("span");
        ornament.className = "wall-ornament";
        ornament.textContent = "✧";

        const message = document.createElement("p");
        message.className = "wall-message";
        message.textContent = wish.message || "";

        const author = document.createElement("p");
        author.className = "wall-author";
        author.textContent = `WITH LOVE, ${wish.name || "Anonymous"}`;

        const date = document.createElement("p");
        date.className = "wall-date";

        if (wish.createdAt && typeof wish.createdAt.toDate === "function") {
            date.textContent = wish.createdAt.toDate().toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
        } else {
            date.textContent = "Recently shared";
        }

        card.append(ornament, message, author, date);
        wishesList.append(card);
    });
}

// Listen for new wishes in real time
function startBirthdayWishesListener() {
    wishesWallStatus.textContent = "Loading beautiful wishes...";

    loadMoreWishesButton.hidden = true;

    const wishesQuery = query(
        collection(db, "rositaBirthdayWishes"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(
        wishesQuery,
        (snapshot) => {
            displayBirthdayWishes(snapshot);
        },
        (error) => {
            console.error("Could not load Rosita's birthday wishes:", error);

            wishesWallStatus.textContent =
                "We couldn't load the wishes right now. Please refresh the page and try again.";
        }
    );
}

// Start listening for wishes
startBirthdayWishesListener();

startGameButton.addEventListener("click", () => {
    appreciationIntro.hidden = true;
    appreciationChoices.hidden = false;
    qualityOptions[0].focus();
});

qualityOptions.forEach((option) => {
    option.addEventListener("click", () => {
        const quality = option.dataset.quality;
        const isSelected = selectedQualityNames.has(quality);

        if (isSelected) {
            selectedQualityNames.delete(quality);
            option.setAttribute("aria-pressed", "false");
        } else {
            selectedQualityNames.add(quality);
            option.setAttribute("aria-pressed", "true");
        }

        updateSelectedQualities();
    });
});

continueGameButton.addEventListener("click", () => {
    if (selectedQualityNames.size === 0) return;

    updateSelectedQualities();
    appreciationChoices.hidden = true;
    document.body.append(balloonStage);
    document.body.classList.add("catch-balloon-game-open");
    balloonStage.hidden = false;
    clearBalloonTimers();
    activeCatchBalloons.clear();
    caughtBalloonCount = 0;
    catchGameComplete = false;
    balloonConfetti.replaceChildren();
    catchBalloonContainer.replaceChildren();
    maintainCatchBalloons();
    balloonHeading.focus({ preventScroll: true });
});

celebrateRositaButton.addEventListener("click", () => {
    appreciationResult.hidden = true;
    appreciationFinish.hidden = false;
});

restartGameButton.addEventListener("click", resetAppreciationGame);
restartAfterCelebrationButton.addEventListener("click", resetAppreciationGame);

writeWishButton.addEventListener("click", () => {
    wishIntro.hidden = true;
    wishForm.hidden = false;
    wishName.focus();
});

wishMessage.addEventListener("input", () => {
    characterCount.textContent = `${wishMessage.value.length} / 500`;
    wishFormError.textContent = "";
});

// =========================================
// SAVE BIRTHDAY WISH TO FIRESTORE
// =========================================

wishForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = wishName.value.trim();
    const message = wishMessage.value.trim();

    wishFormError.textContent = "";

    if (!message) {
        wishFormError.textContent =
            "Please write a birthday wish before sending.";
        wishMessage.focus();
        return;
    }

    if (message.length > 500) {
        wishFormError.textContent =
            "Your birthday wish cannot exceed 500 characters.";
        return;
    }

    if (name.length > 50) {
        wishFormError.textContent =
            "Your name cannot exceed 50 characters.";
        wishName.focus();
        return;
    }

    const submitButton = wishForm.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "SENDING YOUR WISH...";
    }

    try {
        await addDoc(collection(db, "rositaBirthdayWishes"), {
            name: name || "Anonymous",
            message: message,
            createdAt: serverTimestamp()
        });

        showWishConfirmation(
            name,
            message,
            "Your wish has been saved online and added to Rosita's public Birthday Wishes Wall. Thank you!"
        );

    } catch (error) {
        console.error("Could not save Rosita's birthday wish:", error);

        wishFormError.textContent =
            "Your wish couldn't be saved. Please check your internet connection and try again.";

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "SEND MY WISH";
        }
    }
});

writeAnotherWishButton.addEventListener("click", () => {
    wishForm.reset();

    characterCount.textContent = "0 / 500";
    wishFormError.textContent = "";

    wishConfirmation.hidden = true;
    wishIntro.hidden = true;
    wishForm.hidden = false;

    wishName.focus();
});
