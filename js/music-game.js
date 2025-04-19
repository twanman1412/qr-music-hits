// Import Spotify functions
import {
    getTrackInfo,
    playTrack,
    pauseTrack,
    resumeTrack
} from "./spotify.js";

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

// Add this with other DOM elements
const leaderboardBtn = document.createElement('button');
leaderboardBtn.id = 'leaderboard-btn';
leaderboardBtn.textContent = 'View Leaderboard';
leaderboardBtn.classList.add('secondary-btn');

let playedSongs = JSON.parse(localStorage.getItem('playedSongs') || '[]');

// Add this function after the other functions
function viewLeaderboard() {
    localStorage.setItem("currentPage", "music-game");
    window.location.href = '../pages/leaderboard.html';
}

// Add this function to save track history
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

// Game variables
let currentTrackId = null;
let currentTrackInfo = null;
let teams = [];
let activeTeamIndex = 0;
let comparisonYear = 2000; // Default starting year
let isPlaying = false;

// Initialize the game
async function initializeGame() {
    // Load teams from localStorage
    playedSongs = JSON.parse(localStorage.getItem('playedSongs') || '[]');
    const savedTeams = localStorage.getItem('musicGameTeams');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    } else {
        // No teams, redirect to team creation
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

    // Get active team index from localStorage or start with first team
    activeTeamIndex = parseInt(localStorage.getItem('activeTeamIndex') || 0) % teams.length;

    // Get comparison year from localStorage or use default
    comparisonYear = parseInt(localStorage.getItem('comparisonYear') || 2000);

    // Set event listeners
    pauseButton.addEventListener('click', togglePlayPause);
    beforeBtn.addEventListener('click', () => submitAnswer('before'));
    afterBtn.addEventListener('click', () => submitAnswer('after'));
    nextQuestionBtn.addEventListener('click', scanNewTrack);

    // Hide back and scan buttons initially
    newTrackBtn.style.display = 'none';
    backButton.style.display = 'none';

    // Display difficulty
    const difficulty = localStorage.getItem('gameDifficulty') || 'Easy';
    difficultyBadge.textContent = difficulty;

    // Display active player and score
    updatePlayerDisplay();

    // Update the question with comparison year
    comparisonYearElement.textContent = comparisonYear;

    // Load track
    currentTrackId = localStorage.getItem('selectedTrackId');
    if (!currentTrackId) {
        alert('No track selected. Please scan a track first.');
        window.location.href = '../pages/qr-scanner.html';
        return;
    }

    try {
        // Load track info
        await loadTrackInfo();

        // Start playing the track
        await playTrack(currentTrackId);
        isPlaying = true;
        pauseButton.textContent = 'Pause';

    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Failed to initialize game: ' + error.message);
    }
}

// Load track information
async function loadTrackInfo() {
    try {
        if (playedSongs.includes(currentTrackId)) {
            alert('This song has already been played! Scan a new track.');
            scanNewTrack();
            return;
        }

        currentTrackInfo = await getTrackInfo(currentTrackId);

        // Display track info in the player section
        trackName.textContent = currentTrackInfo.name;
        artistName.textContent = currentTrackInfo.artists.map(artist => artist.name).join(', ');

        // Set album art if available
        if (currentTrackInfo.album && currentTrackInfo.album.images && currentTrackInfo.album.images.length > 0) {
            albumArt.style.backgroundImage = `url(${currentTrackInfo.album.images[0].url})`;
        }

        trackInfo.classList.remove('hidden');
        playedSongs.push(currentTrackId);
        localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
    } catch (error) {
        console.error('Error loading track info:', error);
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
    // Disable answer buttons to prevent double submissions
    beforeBtn.disabled = true;
    afterBtn.disabled = true;

    const releaseYear = new Date(currentTrackInfo.album.release_date).getFullYear();
    const isCorrect =
        (answer === 'before' && releaseYear <= comparisonYear) ||
        (answer === 'after' && releaseYear >= comparisonYear);

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
    if (isCorrect) {
        const teamScores = JSON.parse(localStorage.getItem('teamScores'));
        teamScores[activeTeam] += 1;
        localStorage.setItem('teamScores', JSON.stringify(teamScores));

        // Update score display
        updatePlayerDisplay();

        // Save track history
        saveTrackHistory(activeTeam, isCorrect);

        // Check for win condition
        if (teamScores[activeTeam] >= 10) {
            localStorage.setItem('winnerTeam', activeTeam);
            window.location.href = '../pages/victory.html';
            return;
        }
    } else {
        // Save track history for incorrect answer too
        saveTrackHistory(activeTeam, isCorrect);
    }

    // Move to next player
    activeTeamIndex = (activeTeamIndex + 1) % teams.length;
    localStorage.setItem('activeTeamIndex', activeTeamIndex.toString());

    // Show result and next button
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    // Set this song's year as the comparison for the next question
    localStorage.setItem('comparisonYear', releaseYear.toString());

    // Show the scan button and leaderboard button
    nextQuestionBtn.textContent = 'Scan Next Track';

    // Add leaderboard button
    leaderboardBtn.addEventListener('click', viewLeaderboard);
    resultContainer.appendChild(leaderboardBtn);
}

// Update the active player display
function updatePlayerDisplay() {
    const teamScores = JSON.parse(localStorage.getItem('teamScores'));
    const activeTeam = teams[activeTeamIndex];

    // Update active player name and score
    activePlayerDisplay.textContent = activeTeam;
    scoreDisplay.textContent = teamScores[activeTeam];
}

// Move to next player and scan new track
function scanNewTrack() {

    // Update display
    updatePlayerDisplay();

    // Redirect to scanner
    window.location.href = '../pages/qr-scanner.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeGame);