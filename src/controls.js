// controls.js
// Handles keyboard and touch input for car movement

const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};

// Handle keyboard input
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
        case "ArrowUp":
            keys.forward = true;
            break;
        case "s":
        case "ArrowDown":
            keys.backward = true;
            break;
        case "a":
        case "ArrowLeft":
            keys.left = true;
            break;
        case "d":
        case "ArrowRight":
            keys.right = true;
            break;
    }
    console.log("Key down:", event.key, keys); // Debug log
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "w":
        case "ArrowUp":
            keys.forward = false;
            break;
        case "s":
        case "ArrowDown":
            keys.backward = false;
            break;
        case "a":
        case "ArrowLeft":
            keys.left = false;
            break;
        case "d":
        case "ArrowRight":
            keys.right = false;
            break;
    }
    console.log("Key up:", event.key, keys); // Debug log
});

// Handle touch input
let startX = 0;
let startY = 0;
let isDragging = false;

window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = true;
    console.log("Touch start detected at:", startX, startY); // Debug log
});

window.addEventListener("touchmove", (event) => {
    if (!isDragging) return;

    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    keys.left = dx < -50;
    keys.right = dx > 50;
    keys.forward = dy < -50;
    keys.backward = dy > 50;

    console.log("Touch move detected. dx:", dx, "dy:", dy, keys); // Debug log
});

window.addEventListener("touchend", () => {
    isDragging = false;
    keys.forward = false;
    keys.backward = false;
    keys.left = false;
    keys.right = false;
    console.log("Touch end detected. Resetting keys.", keys); // Debug log
});

// Export the keys object so other modules can read it
export { keys };
