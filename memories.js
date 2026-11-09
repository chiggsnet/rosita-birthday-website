/* ROSITA MEMORY GALLERY LIGHTBOX */

const galleryImages = Array.from(
    document.querySelectorAll(".memory-image img")
);

const lightbox = document.getElementById("photoLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");

let currentPhotoIndex = 0;

function showPhoto(index) {
    if (!galleryImages.length) return;

    currentPhotoIndex =
        (index + galleryImages.length) % galleryImages.length;

    lightboxImage.src = galleryImages[currentPhotoIndex].src;
    lightboxImage.alt = galleryImages[currentPhotoIndex].alt;

    lightboxCounter.textContent =
        `${currentPhotoIndex + 1} / ${galleryImages.length}`;

    lightbox.classList.add("active");
}

function closePhoto() {
    lightbox.classList.remove("active");
    lightboxImage.src = "";
}

galleryImages.forEach((image, index) => {
    image.addEventListener("click", () => showPhoto(index));
});

lightboxClose.addEventListener("click", closePhoto);

lightboxPrev.addEventListener("click", (event) => {
    event.stopPropagation();
    showPhoto(currentPhotoIndex - 1);
});

lightboxNext.addEventListener("click", (event) => {
    event.stopPropagation();
    showPhoto(currentPhotoIndex + 1);
});

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closePhoto();
});

document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowRight") showPhoto(currentPhotoIndex + 1);
    if (event.key === "ArrowLeft") showPhoto(currentPhotoIndex - 1);
});