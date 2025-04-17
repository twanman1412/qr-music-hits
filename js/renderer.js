// Import Spotify functions
import {
    getTrackInfo,
    initializePlayer,
    initiateSpotifyLogin,
    isAuthenticated,
    pauseTrack,
    playTrack,
    resumeTrack
} from "./spotify.js";

// DOM Elements
const loginButton = document.getElementById('login-button');
const loginSection = document.getElementById('login-section');
const playerSection = document.getElementById('player-section');
const spotifyLinkInput = document.getElementById('spotify-link');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const songInfo = document.getElementById('song-info');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const songYear = document.getElementById('song-year');
const songAlbum = document.getElementById('song-album');

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        showPlayerUI();
    }
});

// In renderer.js, add to the login handler
loginButton.addEventListener('click', async () => {
    try {
        await initiateSpotifyLogin();
        showPlayerUI();

        // Initialize Spotify Web Playback SDK
        await initializePlayer();
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed: ' + error.message);
    }
});

// Play button handler
playButton.addEventListener('click', async () => {
    const spotifyLink = spotifyLinkInput.value.trim();

    if (!spotifyLink) {
        alert('Please enter a Spotify track link.');
        return;
    }

    try {
        const trackId = extractTrackId(spotifyLink);
        if (!trackId) {
            alert('Invalid Spotify track link.');
            return;
        }

        // Play track
        await playTrack(trackId);

        // Get and display track info
        const trackInfo = await getTrackInfo(trackId);
        displayTrackInfo(trackInfo);

        songInfo.classList.remove('hidden');
    } catch (error) {
        console.error('Error playing track:', error);
        alert('Error playing track: ' + error.message);
    }
});

// Pause track
pauseButton.addEventListener('click', async () => {
    try {
        await pauseTrack();
    } catch (error) {
        console.error('Error pausing track:', error);
    }
});

// Resume track
resumeButton.addEventListener('click', async () => {
    try {
        await resumeTrack();
    } catch (error) {
        console.error('Error resuming track:', error);
    }
});

// Extract track ID from Spotify URL
function extractTrackId(url) {
    const trackIdMatch = url.match(/track[:\/]([a-zA-Z0-9]+)/);
    return trackIdMatch ? trackIdMatch[1] : null;
}

// Display track information
function displayTrackInfo(trackInfo) {
    songTitle.textContent = trackInfo.name;
    songArtist.textContent = trackInfo.artists.map(artist => artist.name).join(', ');
    songYear.textContent = trackInfo.album.release_date ?
        new Date(trackInfo.album.release_date).getFullYear() : 'Unknown';
    songAlbum.textContent = trackInfo.album.name;
}

// Show player UI after login
function showPlayerUI() {
    loginSection.classList.add('hidden');
    playerSection.classList.remove('hidden');
}