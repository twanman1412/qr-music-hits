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
       console.log(tokenData)
       spotifyTokens.access_token = tokenData.access_token;
       spotifyTokens.expires_at = Date.now() + (tokenData.expires_in * 1000);
       if (tokenData.refresh_token) {
           spotifyTokens.refresh_token = tokenData.refresh_token;
       }

       window.localStorage.setItem("spotifyTokens", JSON.stringify(spotifyTokens));
       return true;
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    if (!(spotifyTokens.access_token && spotifyTokens.expires_at > Date.now())) {
        loadSpotifyTokens();
    }
    console.log(`Access token: ${spotifyTokens.access_token}`);
    console.log(`Current time: ${Date.now()}`);
    console.log(`Expires at: ${spotifyTokens.expires_at}`);
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
        try {
            const json = await response.json();
            return json;
        } catch (error) {
            console.warn("Failed to parse JSON response:", error);
            return null;
        }
    }

    return null;
}


// Updated playTrack function to use the SDK
async function playTrack(trackId) {
    // Fallback to playing on active device
    return spotifyRequest('/me/player/play', 'PUT', {
        uris: [`spotify:track:${trackId}`]
    });
}

// Pause playback
async function pauseTrack() {
    try {
        return spotifyRequest('/me/player/pause', 'PUT');
    } catch (error) {
        console.error('Error pausing track:', error);
        return;
    }
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
};

function loadSpotifyTokens() {
    let receivedTokens = window.localStorage.getItem("spotifyTokens");
    if (receivedTokens) {
        spotifyTokens = JSON.parse(receivedTokens);
    } else {
        spotifyTokens = {
            access_token: null,
            expires_at: null
        };
    }
}