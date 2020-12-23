let server = io();
let gameroom = getGameCode();

function getGameCode() {
    let url = window.location.href;
    return url.slice(-5);
}