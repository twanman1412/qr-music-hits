import {
    initiateSpotifyLogin,
    isAuthenticated,
} from "./spotify.js";

const loginButton = document.getElementById('login-button');

function initializeLogin() {
    if (isAuthenticated()) {
        return window.location.href = require('path').join(__dirname, 'pages/team-creation.html');
    }

    loginButton.addEventListener('click', async () => {
        try {
            await initiateSpotifyLogin();
            window.location.href =  require('path').join(__dirname, 'pages/team-creation.html');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed: ' + error.message);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
});
