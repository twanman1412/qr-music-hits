// Get DOM elements
const difficultyCards = document.querySelectorAll('.difficulty-card');
const startGameButton = document.getElementById('start-game-button');
const backButton = document.getElementById('back-button');

// Selected difficulty level
let selectedDifficulty = null;

// Initialize the page
function initialize() {
    // Add event listeners to difficulty cards
    difficultyCards.forEach(card => {
        card.addEventListener('click', () => selectDifficulty(card));
    });

    // Back button returns to previous page
    backButton.addEventListener('click', () => {
        window.location.href = require('path').join(__dirname, 'team-creation.html');
    });

    // Start game button event
    startGameButton.addEventListener('click', startGame);
}

// Handle difficulty selection
function selectDifficulty(selectedCard) {
    // Remove selection from all cards
    difficultyCards.forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    selectedCard.classList.add('selected');

    // Store selected difficulty
    selectedDifficulty = selectedCard.dataset.difficulty;

    // Enable start game button
    startGameButton.disabled = false;
}

// Start the game with selected difficulty
function startGame() {
    if (!selectedDifficulty) {
        alert('Please select a difficulty level');
        return;
    }

    // Store the selected difficulty in localStorage
    localStorage.setItem('gameDifficulty', selectedDifficulty);

    // Redirect to the game page
    window.location.href =  require('path').join(__dirname, 'music-game.html');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);