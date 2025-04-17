// Import Spotify functions
import {
    initiateSpotifyLogin,
    isAuthenticated,
} from "./spotify.js";

// DOM Elements
const loginButton = document.getElementById('login-button');

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        redirectToDifficultySelection();
    }
});

// Login button handler
loginButton.addEventListener('click', async () => {
    try {
        console.log("Initiating Spotify login...");
        await initiateSpotifyLogin();

        // Initialize Spotify Web Playback SDK
        console.log("Initializing Spotify Player...");
        await initializePlayer();

        // Redirect to difficulty selection page
        console.log("Login successful, redirecting to difficulty selection...");
        redirectToDifficultySelection();
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed: ' + error.message);
    }
});

// Redirect to difficulty selection page
function redirectToDifficultySelection() {
    window.location.href =  require('path').join(__dirname, 'pages/team-creation.html');

}