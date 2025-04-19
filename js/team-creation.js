// Get DOM elements
const teamNameInput = document.getElementById('team-name');
const addTeamBtn = document.getElementById('add-team-btn');
const teamsList = document.getElementById('teams-list');
const noTeamsMessage = document.getElementById('no-teams-message');
const continueButton = document.getElementById('continue-button');
const clearButton = document.getElementById('clear-button')

// Teams array
let teams = [];

// Initialize the page
function initialize() {
    // Load any saved teams
    loadTeams();

    // Add event listeners
    addTeamBtn.addEventListener('click', addTeam);
    teamNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTeam();
    });

    continueButton.addEventListener('click', () => {
        saveTeams();
        window.location.href = '../pages/difficulty-selection.html';
    });

    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all teams and game data?')) {

            spotifyTokens = localStorage.getItem("spotifyTokens");
            localStorage.clear()
            localStorage.setItem("spotifyTokens", spotifyTokens);
            teams = [];
            updateTeamsList();
            saveTeams();
        }
    });

    updateTeamsList();
}

// Add a new team
function addTeam() {
    const teamName = teamNameInput.value.trim();

    if (!teamName) {
        alert('Please enter a team name');
        return;
    }

    // Check for duplicate team name
    if (teams.some(team => team.toLowerCase() === teamName.toLowerCase())) {
        alert('A team with this name already exists');
        return;
    }

    // Add team to array
    teams.push(teamName);

    // Clear input
    teamNameInput.value = '';

    // Update UI
    updateTeamsList();

    // Save teams
    saveTeams();
}

// Remove a team
function removeTeam(index) {
    teams.splice(index, 1);
    updateTeamsList();
    saveTeams();
}

// Update the teams list in the UI
function updateTeamsList() {
    // Clear the list
    while (teamsList.firstChild) {
        teamsList.removeChild(teamsList.firstChild);
    }

    // Show message if no teams
    if (teams.length === 0) {
        teamsList.appendChild(noTeamsMessage);
        continueButton.disabled = true;
        return;
    }

    // Hide message
    if (teamsList.contains(noTeamsMessage)) {
        teamsList.removeChild(noTeamsMessage);
    }

    // Add team items
    teams.forEach((team, index) => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';

        const teamName = document.createElement('div');
        teamName.className = 'team-name';
        teamName.textContent = team;

        const teamActions = document.createElement('div');
        teamActions.className = 'team-actions';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeTeam(index));

        teamActions.appendChild(removeBtn);
        teamItem.appendChild(teamName);
        teamItem.appendChild(teamActions);

        teamsList.appendChild(teamItem);
    });

    // Enable continue button if we have teams
    continueButton.disabled = teams.length === 0;
}

// Save teams to localStorage
function saveTeams() {
    localStorage.setItem('musicGameTeams', JSON.stringify(teams));
}

// Load teams from localStorage
function loadTeams() {
    const savedTeams = localStorage.getItem('musicGameTeams');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);