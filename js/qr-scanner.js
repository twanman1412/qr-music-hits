import { playTrack } from './spotify.js';
const { Html5Qrcode } = require('html5-qrcode');

const startScannerButton = document.getElementById('start-scanner');
const stopScannerButton = document.getElementById('stop-scanner');
const backButton = document.getElementById('back-button');
const resultContainer = document.getElementById('result-container');
const scanResult = document.getElementById('scan-result');
const playScannedButton = document.getElementById('play-scanned');
const manualTrackUrl = document.getElementById('manual-track-url');
const manualSubmitButton = document.getElementById('manual-submit');
const continueButton = document.getElementById('continue-button');

let html5QrCode;
let scannedTrackId = null;

// Initialize QR Scanner
function initializeQrScanner() {
    const videoElement = document.getElementById('video');
    html5QrCode = new Html5Qrcode(videoElement.id);

    startScannerButton.addEventListener('click', startScanner);
    stopScannerButton.addEventListener('click', stopScanner);

    backButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    playScannedButton.addEventListener('click', () => {
        localStorage.setItem('selectedTrackId', scannedTrackId);
        window.location.href = '../pages/music-game.html';
    });

    continueButton.addEventListener('click', () => {
        if (scannedTrackId) {
            localStorage.setItem('selectedTrackId', scannedTrackId);
            window.location.href = '../pages/music-game.html';
        }
    });

    // Add manual submission handler
    manualSubmitButton.addEventListener('click', handleManualSubmit);
    manualTrackUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleManualSubmit();
    });
}

// Handle manual track URL submission
function handleManualSubmit() {
    const url = manualTrackUrl.value.trim();

    if (!url) {
        alert('Please enter a Spotify track URL');
        return;
    }

    const trackId = extractTrackId(url);

    if (trackId) {
        scannedTrackId = trackId;
        scanResult.textContent = url;
        resultContainer.classList.remove('hidden');
        continueButton.disabled = false;
        manualTrackUrl.value = '';
    } else {
        alert('Invalid Spotify track URL. Please enter a valid track link.');
    }
}

// Start QR Scanner
async function startScanner() {
    // Same as existing code
}

// Stop QR Scanner
async function stopScanner() {
    // Same as existing code
}

// Handle QR Code Scan Success
function handleScanSuccess(decodedText) {
    console.log('QR Code detected:', decodedText);
    scannedTrackId = extractTrackId(decodedText);

    if (scannedTrackId) {
        scanResult.textContent = decodedText;
        resultContainer.classList.remove('hidden');
        continueButton.disabled = false;
        stopScanner();
    } else {
        alert('Invalid QR code. Please scan a valid Spotify track link.');
    }
}

// Extract Spotify Track ID from URL
function extractTrackId(url) {
    const match = url.match(/track[:\/]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

// Initialize the QR scanner on page load
document.addEventListener('DOMContentLoaded', initializeQrScanner);