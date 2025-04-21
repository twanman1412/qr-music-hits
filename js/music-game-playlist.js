// Import Spotify functions
import {getTrackInfo, pauseTrack, playTrack, resumeTrack} from "./spotify.js";

// DOM Elements - Player section
const trackInfo = document.getElementById('track-info');
const albumArt = document.getElementById('album-art');
const trackName = document.getElementById('track-name');
const artistName = document.getElementById('artist-name');
const pauseButton = document.getElementById('pause-button');

// DOM Elements - Game section
const difficultyBadge = document.getElementById('difficulty-badge');
const scoreDisplay = document.getElementById('score');
const activePlayerDisplay = document.getElementById('active-player');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const comparisonYearElement = document.getElementById('comparison-year');
const beforeBtn = document.getElementById('before-btn');
const afterBtn = document.getElementById('after-btn');
const resultContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const releaseYearElement = document.getElementById('release-year');
const albumNameElement = document.getElementById('album-name');
const nextQuestionBtn = document.getElementById('next-question-btn');

// DOM Elements - Navigation
const newTrackBtn = document.getElementById('new-track-btn');
const backButton = document.getElementById('back-button');

// Game variables
let currentTrackId = null;
let currentTrackInfo = null;
let teams = [];
let activeTeamIndex = 0;
let comparisonYear = 2000; // Default starting year
let isPlaying = false;
let gamePlaylist = null;
let currentTrackIndex = 0;

// Initialize leaderboard button
const leaderboardBtn = document.createElement('button');
leaderboardBtn.id = 'leaderboard-btn';
leaderboardBtn.textContent = 'View Leaderboard';
leaderboardBtn.classList.add('secondary-btn');

// For tracking played songs
let playedSongs = JSON.parse(localStorage.getItem('playedSongs') || '[]');

// Initialize the game
async function initializeGame() {
    // Load playlist from localStorage
    const savedPlaylist = localStorage.getItem('gamePlaylist');
    if (!savedPlaylist) {
        alert('No playlist found. Please select a playlist first.');
        window.location.href = '../pages/select-playlist.html';
        return;
    }

    gamePlaylist = JSON.parse(savedPlaylist);

    // Get current track index or start at 0
    currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex') || 0);
    if (currentTrackIndex >= gamePlaylist.tracks.length) {
        currentTrackIndex = 0; // Reset if index is beyond playlist length
    }

    // Load teams from localStorage
    const savedTeams = localStorage.getItem('musicGameTeams');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    } else {
        alert('No teams found. Please create teams first.');
        window.location.href = '../pages/team-creation.html';
        return;
    }

    // Initialize scores if not already in localStorage
    if (!localStorage.getItem('teamScores')) {
        const initialScores = teams.reduce((acc, team) => {
            acc[team] = 0;
            return acc;
        }, {});
        localStorage.setItem('teamScores', JSON.stringify(initialScores));
    }

    // Get active team index
    activeTeamIndex = parseInt(localStorage.getItem('activeTeamIndex') || 0) % teams.length;

    // Get comparison year

    // Set event listeners
    pauseButton.addEventListener('click', togglePlayPause);
    beforeBtn.addEventListener('click', () => submitAnswer('before'));
    afterBtn.addEventListener('click', () => submitAnswer('after'));
    nextQuestionBtn.addEventListener('click', loadNextTrack);
    backButton.addEventListener('click', () => {
        window.location.href = require('path').join(__dirname, 'team-creation.html');
    });

    // Display difficulty
    difficultyBadge.textContent = localStorage.getItem('gameDifficulty') || 'Easy';

    // Display active player and score
    updatePlayerDisplay();
    await loadNextTrack();
}

// Load the next track from playlist
async function loadNextTrack() {

    localStorage.setItem('played', String(true));

    comparisonYear = parseInt(localStorage.getItem('comparisonYear') || 2000);
    comparisonYearElement.textContent = comparisonYear;

    // Reset UI state for new question
    beforeBtn.disabled = false;
    afterBtn.disabled = false;
    questionContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    trackInfo.classList.add('hidden');

    if (currentTrackIndex >= gamePlaylist.tracks.length) {
        // End of playlist reached
        alert('You have played all tracks in the playlist!');
        window.location.href = require('path').join(__dirname, 'difficulty-selection.html');
        return;
    }

    const track = gamePlaylist.tracks[currentTrackIndex];
    currentTrackId = track.id;

    try {
        // Load track info and play
        const doPlay = await loadTrackInfo();
        if (doPlay) {
            await playTrack(currentTrackId);
            isPlaying = true;
            pauseButton.textContent = 'Pause';
        }
    } catch (error) {
        console.error('Error loading track:', error);
        alert('Failed to load track: ' + error.message);
    }
}

// Load track information
async function loadTrackInfo() {
    try {
        currentTrackInfo = await getTrackInfo(currentTrackId);

        // Display track info in the player section
        trackName.textContent = currentTrackInfo.name;
        artistName.textContent = currentTrackInfo.artists.map(artist => artist.name).join(', ');

        // Set album art if available
        if (currentTrackInfo.album && currentTrackInfo.album.images && currentTrackInfo.album.images.length > 0) {
            albumArt.style.backgroundImage = `url(${currentTrackInfo.album.images[0].url})`;
        }

        if (playedSongs.includes(currentTrackId)) {
            console.warn("track has been played")
            return false;
        } else {
            playedSongs.push(currentTrackId);
            localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
            return true;
        }

    } catch (error) {
        console.error('Error loading track info:', error);
        return false;
    }
}

// Toggle play/pause
async function togglePlayPause() {
    try {
        if (isPlaying) {
            await pauseTrack();
            pauseButton.textContent = 'Play';
        } else {
            await resumeTrack();
            pauseButton.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

// Submit answer and check if correct
async function submitAnswer(answer) {
    trackInfo.classList.remove('hidden');
    beforeBtn.disabled = true;
    afterBtn.disabled = true;

    const releaseYear = new Date(currentTrackInfo.album.release_date).getFullYear();
    const isCorrect =
        (answer === 'before' && releaseYear <= comparisonYear) ||
        (answer === 'after' && releaseYear >= comparisonYear);

    localStorage.setItem('lastAnswer', answer);

    // Update display with result
    resultMessage.textContent = isCorrect ?
        '✓ Correct! You earned 1 point.' :
        '✗ Incorrect! No points earned.';

    resultContainer.className = isCorrect ? 'result-correct' : 'result-incorrect';

    // Show song details
    releaseYearElement.textContent = String(releaseYear);
    albumNameElement.textContent = currentTrackInfo.album.name;

    const activeTeam = teams[activeTeamIndex];

    // Update score if correct
    const teamScores = JSON.parse(localStorage.getItem('teamScores'));
    if (isCorrect) {
        teamScores[activeTeam] += 1;
        localStorage.setItem('teamScores', JSON.stringify(teamScores));
        updatePlayerDisplay();
    }

    saveTrackHistory(activeTeam, isCorrect);

    // Show result and next button
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    if (teamScores[activeTeam] >= 10) {
        localStorage.setItem('winnerTeam', activeTeam);
        window.location.href = '../pages/victory.html';
        return;
    }

    // Update next question button
    nextQuestionBtn.textContent = 'Next Track';

    // Add leaderboard button
    leaderboardBtn.addEventListener('click', viewLeaderboard);
    if (!resultContainer.contains(leaderboardBtn)) {
        resultContainer.appendChild(leaderboardBtn);
    }

    // Set this song's year as the comparison for the next question
    comparisonYear = releaseYear.toString();
    comparisonYearElement.textContent = comparisonYear;
    localStorage.setItem('comparisonYear', releaseYear.toString());

    // Move to next track index (but don't load yet)
    currentTrackIndex++;
    localStorage.setItem('currentTrackIndex', currentTrackIndex.toString());

    // Move to next team for the next track
    activeTeamIndex = (activeTeamIndex + 1) % teams.length;
    localStorage.setItem('activeTeamIndex', activeTeamIndex.toString());
}

// Update the active player display
function updatePlayerDisplay() {
    const teamScores = JSON.parse(localStorage.getItem('teamScores'));
    const activeTeam = teams[activeTeamIndex];
    activePlayerDisplay.textContent = activeTeam;
    scoreDisplay.textContent = teamScores[activeTeam];
}

// View leaderboard
function viewLeaderboard() {
    localStorage.setItem("currentPage", "music-game-playlist");
    window.location.href = '../pages/leaderboard.html';
}

// Save track history
function saveTrackHistory(team, isCorrect) {
    const trackHistory = JSON.parse(localStorage.getItem('trackHistory') || '{}');

    if (!trackHistory[team]) {
        trackHistory[team] = [];
    }

    trackHistory[team].push({
        trackId: currentTrackId,
        trackName: currentTrackInfo.name,
        artistName: currentTrackInfo.artists.map(artist => artist.name).join(', '),
        releaseYear: new Date(currentTrackInfo.album.release_date).getFullYear(),
        correct: isCorrect
    });

    localStorage.setItem('trackHistory', JSON.stringify(trackHistory));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeGame);