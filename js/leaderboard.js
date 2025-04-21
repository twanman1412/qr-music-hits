// Get DOM elements
const teamsLeaderboard = document.getElementById('teams-leaderboard');
const backToGameBtn = document.getElementById('back-to-game-btn');

// Initialize the leaderboard
function initialize() {
    // Add event listener to back button
    backToGameBtn.addEventListener('click', () => {
        const previousPage = localStorage.getItem('currentPage') || 'index';

        if (previousPage === 'victory') {
            window.alert("come from victory")
            window.location.href = '../pages/victory.html';
        } else {
            switch (localStorage.getItem("gameDifficulty")) {
                case "easy":
                    window.location.href = '../pages/music-game-jora.html';
                    break;
                case "medium":
                    window.location.href = '../pages/music-game-playlist.html';
                    break;

            }
        }
    });

    // Load teams and scores from localStorage
    loadLeaderboard();
}

// Load the leaderboard data
function loadLeaderboard() {
    const teams = JSON.parse(localStorage.getItem('musicGameTeams') || '[]');
    const teamScores = JSON.parse(localStorage.getItem('teamScores') || '{}');
    const trackHistory = JSON.parse(localStorage.getItem('trackHistory') || '{}');

    // Sort teams by score, descending
    const sortedTeams = [...teams].sort((a, b) => (teamScores[b] || 0) - (teamScores[a] || 0));

    // Clear the leaderboard
    teamsLeaderboard.innerHTML = '';

    if (sortedTeams.length === 0) {
        teamsLeaderboard.innerHTML = '<p class="no-data">No teams found.</p>';
        return;
    }

    // Add teams to the leaderboard
    sortedTeams.forEach(team => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';

        const teamHeader = document.createElement('div');
        teamHeader.className = 'team-header';
        teamHeader.addEventListener('click', () => toggleTeamHistory(team));

        const teamName = document.createElement('div');
        teamName.className = 'team-name';
        teamName.textContent = team;

        const teamScore = document.createElement('div');
        teamScore.className = 'team-score';
        teamScore.textContent = `Score: ${teamScores[team] || 0}`;

        teamHeader.appendChild(teamName);
        teamHeader.appendChild(teamScore);

        const teamHistory = document.createElement('div');
        teamHistory.className = 'team-history';
        teamHistory.id = `history-${team.replace(/\s+/g, '-')}`;

        // Add track history if available
        const history = trackHistory[team] || [];
        if (history.length === 0) {
            teamHistory.innerHTML = '<p>No tracks played yet.</p>';
        } else {
            history.forEach(entry => {
                const trackItem = document.createElement('div');
                trackItem.className = 'track-item';

                const trackName = document.createElement('div');
                trackName.className = 'track-name';
                trackName.textContent = `${entry.trackName} - ${entry.artistName} (${entry.releaseYear})`;

                const trackResult = document.createElement('div');
                trackResult.className = `track-result ${entry.correct ? 'correct' : 'incorrect'}`;
                trackResult.textContent = entry.correct ? '✓ Correct' : '✗ Incorrect';

                trackItem.appendChild(trackName);
                trackItem.appendChild(trackResult);
                teamHistory.appendChild(trackItem);
            });
        }

        teamItem.appendChild(teamHeader);
        teamItem.appendChild(teamHistory);

        teamsLeaderboard.appendChild(teamItem);
    });
}

// Toggle the team history section
function toggleTeamHistory(team) {
    const historyId = `history-${team.replace(/\s+/g, '-')}`;
    const historyElement = document.getElementById(historyId);
    historyElement.classList.toggle('expanded');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);