const difficultyCards = document.querySelectorAll('.difficulty-card');
const startGameButton = document.getElementById('start-game-button');
const backButton = document.getElementById('back-button');

let selectedDifficulty = null;

function initialize() {
    difficultyCards.forEach(card => {
        card.addEventListener('click', () => selectDifficulty(card));
    });

    backButton.addEventListener('click', () => {
        window.location.href = require('path').join(__dirname, 'team-creation.html');
    });

    startGameButton.addEventListener('click', startGame);
}

function selectDifficulty(selectedCard) {
    difficultyCards.forEach(card => {
        card.classList.remove('selected');
    });

    selectedCard.classList.add('selected');

    selectedDifficulty = selectedCard.dataset.difficulty;

    startGameButton.disabled = false;
}

function startGame() {
    if (!selectedDifficulty) {
        alert('Please select a difficulty level');
        return;
    }

    localStorage.setItem('gameDifficulty', selectedDifficulty);
    switch (selectedDifficulty) {
        case "easy":
            window.location.href =  require('path').join(__dirname, 'music-game-jora.html');
            break;
        case "medium":
            window.location.href =  require('path').join(__dirname, 'select-playlist.html');
            break;
        case "hard":
            window.location.href =  require('path').join(__dirname, 'qr-scanner-gameless.html');
            break;
        default:
            alert('Invalid difficulty level');
            return;
    }
}

document.addEventListener('DOMContentLoaded', initialize);