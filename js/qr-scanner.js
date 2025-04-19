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
const cameraSelect = document.getElementById('camera-select')

let html5QrCode;
let scannedTrackId = null;
let cameras = []

// Initialize QR Scanner
function initializeQrScanner() {
    const videoElement = document.getElementById('scanner-container');
    html5QrCode = new Html5Qrcode(videoElement.id);

    navigator.mediaDevices.getUserMedia({ video: true})
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            getCameras();
        })
        .catch(error => {
            console.error('Camera access denied: ', error);
            alert('Please allow camera access to use the scanner');
        });

    cameraSelect.addEventListener('change', () => {

        if (html5QrCode.isScannig) {
            stopScanner().then(() => startScanner());
        }

        localStorage.setItem('preferredCameraId', cameraSelect.value);
    });

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

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind == 'videoinput');

        cameraSelect.innerHTML = '';

        cameras.forEach((camera, index) => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.text = camera.label || `Camera ${index + 1}`;
            cameraSelect.appendChild(option);
        });

        const savedCameraId = localStorage.getItem('preferredCameraId');
        if (savedCameraId) {
            cameraSelect.value = savedCameraId;
        }
    } catch (error) {
        console.error('Error getting cameras: ', error);
    }
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

async function startScanner() {
    try {
        const selectedCameraId = cameraSelect.value;
        const config = { fps: 10, qrbox: 250 };

        const cameraConfig = selectedCameraId 
            ? { deviceId: selectedCameraId }
            : { facingMode: 'environment' };
        await html5QrCode.start(
            cameraConfig,
            config,
            handleScanSuccess
        );
        startScannerButton.classList.add('hidden');
        stopScannerButton.classList.remove('hidden');
    } catch (error) {
        console.error('Error starting scanner:', error);
        alert('Failed to start scanner.');
    }
}

// Stop QR Scanner
async function stopScanner() {
    try {
        await html5QrCode.stop();
        startScannerButton.classList.remove('hidden');
        stopScannerButton.classList.add('hidden');
    } catch (error) {
        console.error('Error stopping scanner:', error);
        alert('Failed to stop scanner.');
    }
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
