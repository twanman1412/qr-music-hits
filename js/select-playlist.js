// Get DOM elements
const playlistUrlInput = document.getElementById('playlist-url');
const loadPlaylistBtn = document.getElementById('load-playlist-btn');
const usePlaylistBtn = document.getElementById('use-playlist-btn');
const backButton = document.getElementById('back-button');
const playlistInfo = document.getElementById('playlist-info');
const playlistImage = document.getElementById('playlist-image');
const playlistName = document.getElementById('playlist-name');
const playlistOwner = document.getElementById('playlist-owner');
const trackCount = document.getElementById('track-count');
const tracksContainer = document.getElementById('tracks-container');
const loadingElement = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// Import Spotify functions - adjust the path if needed
import { isAuthenticated, initiateSpotifyLogin, getPlaylistInfo, getPlaylistTracks } from './spotify.js';

// Track list data
let currentPlaylist = {
    name: '',
    owner: '',
    image: '',
    tracks: []
};

// Initialize the page
async function initialize() {
    // Add event listeners
    loadPlaylistBtn.addEventListener('click', handleLoadPlaylist);
    usePlaylistBtn.addEventListener('click', handleUsePlaylist);
    backButton.addEventListener('click', navigateBack);

    // Check if authenticated with Spotify
    if (!isAuthenticated()) {
        try {
            await initiateSpotifyLogin();
        } catch (error) {
            showError('Failed to authenticate with Spotify. Please try again.');
            console.error('Authentication error:', error);
        }
    }
}

// Handle loading a playlist from URL
async function handleLoadPlaylist() {
    const url = playlistUrlInput.value.trim();

    if (!url) {
        showError('Please enter a valid Spotify playlist URL');
        return;
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(url);

    if (!playlistId) {
        showError('Invalid Spotify playlist URL format');
        return;
    }

    showLoading(true);

    try {
        await fetchRealPlaylistData(playlistId);
        showLoading(false);
        displayPlaylistInfo();
        usePlaylistBtn.disabled = false;
    } catch (error) {
        showError('Failed to load playlist: ' + error.message);
        showLoading(false);
    }
}

// Extract playlist ID from Spotify URL
function extractPlaylistId(url) {
    // Match patterns like: https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

// Fetch real playlist data from Spotify API
async function fetchRealPlaylistData(playlistId) {
    try {
        // Get playlist info
        const playlistData = await getPlaylistInfo(playlistId);

        // Get all tracks
        const tracks = await getPlaylistTracks(playlistId);

        // Set current playlist
        currentPlaylist = {
            name: playlistData.name,
            owner: playlistData.owner.display_name,
            image: playlistData.images[0]?.url || '',
            tracks: tracks
        };

        return currentPlaylist;
    } catch (error) {
        console.error('Error fetching playlist:', error);
        throw new Error('Could not load playlist from Spotify');
    }
}

// Rest of the functions (displayPlaylistInfo, renderTracks, etc.) remain the same

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);
// Display the playlist information
function displayPlaylistInfo() {
    // Update UI with playlist info
    playlistName.textContent = currentPlaylist.name;
    playlistOwner.textContent = `Created by: ${currentPlaylist.owner}`;
    trackCount.textContent = `${currentPlaylist.tracks.length} songs`;

    if (currentPlaylist.image) {
        playlistImage.style.backgroundImage = `url(${currentPlaylist.image})`;
    }

    // Show the playlist info
    playlistInfo.classList.remove('hidden');

    // Display tracks
    renderTracks();
}

// Render the tracks list
function renderTracks() {
    tracksContainer.innerHTML = '';

    currentPlaylist.tracks.slice(0, 20).forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
        `;
        tracksContainer.appendChild(trackElement);
    });

    if (currentPlaylist.tracks.length > 20) {
        const moreTracksElement = document.createElement('div');
        moreTracksElement.className = 'more-tracks';
        moreTracksElement.textContent = `+ ${currentPlaylist.tracks.length - 20} more songs`;
        tracksContainer.appendChild(moreTracksElement);
    }
}

// Handle using the selected playlist
function handleUsePlaylist() {
    // Randomize tracks
    const randomizedTracks = [...currentPlaylist.tracks];
    shuffleArray(randomizedTracks);

    // Store in localStorage
    const playlistData = {
        name: currentPlaylist.name,
        owner: currentPlaylist.owner,
        image: currentPlaylist.image,
        tracks: randomizedTracks
    };

    localStorage.setItem('gamePlaylist', JSON.stringify(playlistData));

    // Navigate to difficulty selection
    window.location.href = require('path').join(__dirname, 'music-game-playlist.html');
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Navigate back to previous page
function navigateBack() {
    window.location.href = require('path').join(__dirname, 'difficulty-selection.html');
}

// Show loading state
function showLoading(isLoading) {
    if (isLoading) {
        loadingElement.style.display = 'block';
        errorMessage.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    loadingElement.style.display = 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);