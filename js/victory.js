const winnerNameElement = document.getElementById('winner-name');
const winnerScoreElement = document.getElementById('winner-score');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const confettiContainer = document.getElementById('confetti-container');

function initializeVictory() {

    const winnerTeam = localStorage.getItem('winnerTeam');
    const teamScores = JSON.parse(localStorage.getItem('teamScores') || '{}');
    const winnerScore = teamScores[winnerTeam] || 0;

    winnerNameElement.textContent = winnerTeam;
    winnerScoreElement.textContent = winnerScore;

    localStorage.setItem('currentPage', 'victory');

    viewLeaderboardBtn.addEventListener('click', () => {
        window.location.href = './leaderboard.html';
    });
    mainMenuBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    createConfetti();
}

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

document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
            }
        }
    </style>
`);

document.addEventListener('DOMContentLoaded', initializeVictory);