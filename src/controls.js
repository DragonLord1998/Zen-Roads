// controls.js
// This module handles keyboard input and provides a simple API to check if keys are pressed.

// Keep an object of key states
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
        case "ArrowUp":
            keys.forward = true; break;
        case "s":
        case "ArrowDown":
            keys.backward = true; break;
        case "a":
        case "ArrowLeft":
            keys.left = true; break;
        case "d":
        case "ArrowRight":
            keys.right = true; break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "w":
        case "ArrowUp":
            keys.forward = false; break;
        case "s":
        case "ArrowDown":
            keys.backward = false; break;
        case "a":
        case "ArrowLeft":
            keys.left = false; break;
        case "d":
        case "ArrowRight":
            keys.right = false; break;
    }
});

// Export the keys object so other modules can read it
export { keys };
