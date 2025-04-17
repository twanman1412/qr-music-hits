// Get DOM elements
const winnerNameElement = document.getElementById('winner-name');
const winnerScoreElement = document.getElementById('winner-score');
const playAgainBtn = document.getElementById('play-again-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const confettiContainer = document.getElementById('confetti-container');

// Initialize the victory page
function initializeVictory() {
    // Get the winner team from localStorage
    const winnerTeam = localStorage.getItem('winnerTeam');

    if (!winnerTeam) {
        window.location.href = '../index.html';
        return;
    }

    // Get the scores
    const teamScores = JSON.parse(localStorage.getItem('teamScores') || '{}');
    const winnerScore = teamScores[winnerTeam] || 0;

    // Display winner info
    winnerNameElement.textContent = winnerTeam;
    winnerScoreElement.textContent = winnerScore;

    // Add button event listeners
    playAgainBtn.addEventListener('click', startNewGame);
    viewLeaderboardBtn.addEventListener('click', viewLeaderboard);
    mainMenuBtn.addEventListener('click', goToMainMenu);

    // Create confetti animation
    createConfetti();

    // Store current page for navigation tracking
    localStorage.setItem('currentPage', 'victory');
}

// Start a new game
function startNewGame() {
    // Reset active player to first team
    localStorage.setItem('activeTeamIndex', '0');

    // Reset played songs tracking
    localStorage.setItem('playedSongs', JSON.stringify([]));

    // Redirect to scan page
    window.location.href = '../pages/qr-scanner.html';
}

// View leaderboard
function viewLeaderboard() {
    window.location.href = '../pages/leaderboard.html';
}

// Go to main menu
function goToMainMenu() {
    window.location.href = '../index.html';
}

// Create confetti animation
function createConfetti() {
    const colors = ['#1DB954', '#FFFFFF', '#191414', '#FFD700', '#FF69B4'];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -20 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.opacity = Math.random();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            confettiContainer.appendChild(confetti);

            // Animate falling
            const animationDuration = Math.random() * 3 + 2;
            confetti.style.animation = `fall ${animationDuration}s linear forwards`;

            // Remove after animation completes
            setTimeout(() => {
                confetti.remove();
            }, animationDuration * 1000);
        }, Math.random() * 3000);
    }
}

// Add this style to handle the confetti animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
            }
        }
    </style>
`);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeVictory);