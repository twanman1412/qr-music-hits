const { ipcRenderer } = window.require('electron');
const fetch = require('node-fetch');

// Store authentication tokens
let spotifyTokens = {
    access_token: null,
    expires_at: null
};

let player = null;
let deviceId = null;


// Initialize Spotify authentication
async function initiateSpotifyLogin() {
    try {
        const { result_code, code_verifier } = await ipcRenderer.invoke('open-auth-window');
        if (!result_code) {
            console.log(result_code, code_verifier)
            throw new Error("Authentication failed");
        }


        const path = require('path');
        const config = require(path.join(__dirname, 'js/config.js'));

        console.log("Token received, exchanging for access token...");
        console.log(`Result code: ${result_code}`);
        console.log(`Client ID: ${config.SPOTIFY_CLIENT_ID}`);

       // Convert code to token
       const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
           },
           body: new URLSearchParams({
               grant_type: 'authorization_code',
               code: result_code,
               redirect_uri: 'http://127.0.0.1:8888/callback',
               client_id: config.SPOTIFY_CLIENT_ID,
               code_verifier: code_verifier,
           }),
       });

       console.log(tokenResponse)

       if (!tokenResponse.ok) {
           throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
       }

       console.log("Token exchange successful, storing tokens...");

       const tokenData = await tokenResponse.json();
       spotifyTokens.access_token = tokenData.access_token;
       spotifyTokens.expires_at = Date.now() + (tokenData.expires_in * 1000);
       if (tokenData.refresh_token) {
           spotifyTokens.refresh_token = tokenData.refresh_token;
       }

       return true;
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}

// Initialize the Web Playback SDK
function initializePlayer() {
    return new Promise((resolve, reject) => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            player = new Spotify.Player({
                name: 'QR Music Hits Player',
                getOAuthToken: cb => cb(spotifyTokens.access_token),
                volume: 0.5
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => {
                console.error('Initialization error:', message);
                reject(message);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Authentication error:', message);
                reject(message);
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Account error:', message);
                reject('Premium account required');
            });

            player.addListener('playback_error', ({ message }) => {
                console.error('Playback error:', message);
            });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                deviceId = device_id;
                resolve(device_id);
            });

            // Connect to the player
            player.connect();
        };
    });
}

// Check if user is authenticated
function isAuthenticated() {
    return spotifyTokens.access_token && spotifyTokens.expires_at > Date.now();
}

// Make API requests to Spotify
async function spotifyRequest(endpoint, method = 'GET', body = null) {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated with Spotify');
    }

    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${spotifyTokens.access_token}`,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    if (response.status !== 204) { // No content
        return response.json();
    }

    return null;
}


// Updated playTrack function to use the SDK
async function playTrack(trackId) {
    if (deviceId) {
        // Play on our Web Playback SDK instance
        return spotifyRequest(`/me/player/play?device_id=${deviceId}`, 'PUT', {
            uris: [`spotify:track:${trackId}`]
        });
    } else {
        // Fallback to playing on active device
        return spotifyRequest('/me/player/play', 'PUT', {
            uris: [`spotify:track:${trackId}`]
        });
    }
}

// Pause playback
async function pauseTrack() {
    return spotifyRequest('/me/player/pause', 'PUT');
}

// Resume playback
async function resumeTrack() {
    return spotifyRequest('/me/player/play', 'PUT');
}

// Get track information
async function getTrackInfo(trackId) {
    return spotifyRequest(`/tracks/${trackId}`);
}

export {
    initiateSpotifyLogin,
    isAuthenticated,
    playTrack,
    pauseTrack,
    resumeTrack,
    getTrackInfo,
    initializePlayer
};