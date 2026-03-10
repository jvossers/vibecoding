const ROUND_SIZE = 10;
const STORAGE_KEY_PREFIX = 'sightReadingHighscore';

let enabledClefs = ['treble', 'bass'];
let noteCount = 1;
let enabledNoteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function currentClefSelection() {
    const sel = document.querySelector('.clef-btns button.selected');
    if (sel) {
        const v = sel.dataset.clef;
        if (v === 'both') return ['treble', 'bass'];
        return [v];
    }
    return enabledClefs;
}

function currentNoteCount() {
    const sel = document.querySelector('.note-count-btns button.selected');
    return sel ? parseInt(sel.dataset.count) : noteCount;
}

function storageKey() {
    const suffix = currentClefSelection().slice().sort().join('+');
    const notes = currentEnabledNotes().slice().sort().join('');
    return `${STORAGE_KEY_PREFIX}_${suffix}_n${currentNoteCount()}_${notes}`;
}

function scrollToMiddleC() {
    const piano = document.querySelector('.piano');
    const middleC = document.querySelector('.key[data-note="C4"]');
    if (piano && middleC) {
        piano.scrollLeft = middleC.offsetLeft - piano.clientWidth / 2 + middleC.offsetWidth / 2;
    }
}

// --- Web Audio piano synth ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SEMITONE_OFFSETS = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 };

function noteFrequency(noteStr) {
    const match = noteStr.match(/^([A-G]#?)(\d)$/);
    if (!match) return null;
    const [, letter, octStr] = match;
    const semitone = SEMITONE_OFFSETS[letter] + (parseInt(octStr) - 4) * 12;
    return 440 * Math.pow(2, semitone / 12);
}

function playNote(noteName) {
    const freq = noteFrequency(noteName);
    if (!freq) return;
    const t = audioCtx.currentTime;

    // Fundamental
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;

    // Soft overtone for richness
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;

    const gain1 = audioCtx.createGain();
    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc1.connect(gain1).connect(audioCtx.destination);
    osc2.connect(gain2).connect(audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.2);
    osc2.stop(t + 0.8);
}

const canvas = document.getElementById('staff');
const ctx = canvas.getContext('2d');
const feedbackEl = document.getElementById('feedback');
const progressEl = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const highscoreEl = document.getElementById('highscore');
const summaryEl = document.getElementById('summary');
const summaryTimeEl = document.getElementById('summaryTime');
const summaryAccuracyEl = document.getElementById('summaryAccuracy');
const summaryBestEl = document.getElementById('summaryBest');
const newBestEl = document.getElementById('newBest');

// Hi-DPI support
function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 16;
    const h = 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
}

const LINE_GAP = 18;
const NOTE_RADIUS = 8;

function drawStaff(w, h) {
    const staffTop = h / 2 - 2 * LINE_GAP;
    ctx.strokeStyle = '#8899aa';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = staffTop + i * LINE_GAP;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, staffTop);
    ctx.lineTo(30, staffTop + 4 * LINE_GAP);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - 10, staffTop);
    ctx.lineTo(w - 10, staffTop + 4 * LINE_GAP);
    ctx.stroke();
    return staffTop;
}

function drawTrebleClef(staffTop) {
    ctx.font = '93px Bravura, Noto Music, serif';
    ctx.fillStyle = '#ddeeff';
    ctx.fillText('\u{1D11E}', 34, staffTop + 4 * LINE_GAP + 6);
}

function drawBassClef(staffTop) {
    ctx.font = '60px Bravura, Noto Music, serif';
    ctx.fillStyle = '#ddeeff';
    ctx.fillText('\u{1D122}', 36, staffTop + 2.1 * LINE_GAP);
}

const trebleNotes = {
    'F5': 0, 'E5': 1, 'D5': 2, 'C5': 3, 'B4': 4,
    'A4': 5, 'G4': 6, 'F4': 7, 'E4': 8,
    'D4': 9, 'C4': 10
};

const bassNotes = {
    'B3': -1, 'A3': 0, 'G3': 1, 'F3': 2, 'E3': 3,
    'D3': 4, 'C3': 5, 'B2': 6, 'A2': 7, 'G2': 8
};

// Notes available on the 4-octave piano (C2–B5)
const PIANO_NOTES = new Set([
    'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
    'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'
]);

function noteLetter(note) {
    return note.replace(/[0-9]/g, '');
}

function currentEnabledNotes() {
    const btns = document.querySelectorAll('.note-toggle-btns button.selected');
    const letters = Array.from(btns).map(b => b.dataset.noteToggle);
    return letters.length > 0 ? letters : ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
}

function randomNotes(clef, count) {
    const allPool = Object.keys(clef === 'treble' ? trebleNotes : bassNotes);
    const pool = allPool.filter(n => PIANO_NOTES.has(n) && enabledNoteLetters.includes(noteLetter(n)));
    // Pick count random notes (no duplicate letters)
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picked = [];
    const usedLetters = new Set();
    for (const note of shuffled) {
        if (picked.length >= count) break;
        const letter = noteLetter(note);
        if (usedLetters.has(letter)) continue;
        usedLetters.add(letter);
        picked.push(note);
    }
    return picked;
}

function drawNotes(notes, clef, w, staffTop) {
    const map = clef === 'treble' ? trebleNotes : bassNotes;
    const ledgerW = NOTE_RADIUS + 6;
    // Space notes evenly across the staff area after the clef
    const startX = 100;
    const endX = w - 10;
    const slotWidth = (endX - startX) / notes.length;

    for (let i = 0; i < notes.length; i++) {
        const x = startX + slotWidth * (i + 0.5);
        const offset = map[notes[i]];
        const y = staffTop + offset * (LINE_GAP / 2);

        // Ledger lines
        ctx.strokeStyle = '#8899aa';
        ctx.lineWidth = 1;
        if (offset > 8) {
            for (let li = 10; li <= offset; li += 2) {
                const ly = staffTop + li * (LINE_GAP / 2);
                ctx.beginPath();
                ctx.moveTo(x - ledgerW, ly);
                ctx.lineTo(x + ledgerW, ly);
                ctx.stroke();
            }
        }
        if (offset < 0) {
            for (let li = -2; li >= offset; li -= 2) {
                const ly = staffTop + li * (LINE_GAP / 2);
                ctx.beginPath();
                ctx.moveTo(x - ledgerW, ly);
                ctx.lineTo(x + ledgerW, ly);
                ctx.stroke();
            }
        }

        // Note head
        const dimmed = i < guessIndex;
        ctx.fillStyle = dimmed ? '#555' : '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x, y, NOTE_RADIUS + 1, NOTE_RADIUS - 1, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = dimmed ? '#555' : '#ffffff';
        ctx.lineWidth = 2;
        const stemUp = offset >= 4;
        ctx.beginPath();
        if (stemUp) {
            ctx.moveTo(x + NOTE_RADIUS, y);
            ctx.lineTo(x + NOTE_RADIUS, y - 3 * LINE_GAP);
        } else {
            ctx.moveTo(x - NOTE_RADIUS, y);
            ctx.lineTo(x - NOTE_RADIUS, y + 3 * LINE_GAP);
        }
        ctx.stroke();
    }
}

// Game state
let currentClef = 'treble';
let currentNotes = [];
let guessIndex = 0;        // index of next note to guess (left to right)
let confirmedNotes = [];   // note letters guessed correctly so far
let guessed = false;       // true when this turn is resolved
let correctCount = 0;
let totalGuesses = 0;
let startTime = 0;
let timerInterval = null;
let roundOver = false;
let gameStarted = false;

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');

// Highscore: { ms } (fastest time in milliseconds to 10 correct)
function loadHighscore() {
    try {
        const hs = JSON.parse(localStorage.getItem(storageKey()));
        if (hs && !hs.ms) return null; // discard old format
        return hs;
    } catch { return null; }
}

function saveHighscore(entry) {
    localStorage.setItem(storageKey(), JSON.stringify(entry));
}

const resetHsEl = document.getElementById('resetHs');

function displayHighscore() {
    const hs = loadHighscore();
    if (hs) {
        highscoreEl.textContent = `Best: ${formatTime(hs.ms)}`;
        resetHsEl.classList.add('visible');
    } else {
        highscoreEl.textContent = '';
        resetHsEl.classList.remove('visible');
    }
}

resetHsEl.addEventListener('click', () => {
    if (confirm('Reset high score?')) {
        localStorage.removeItem(storageKey());
        displayHighscore();
    }
});

function formatTime(ms) {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = (totalSec % 60).toFixed(1);
    return min > 0 ? `${min}:${sec.padStart(4, '0')}` : `${sec}s`;
}

let elapsedBeforePause = 0;

function startTimer() {
    startTime = performance.now();
    elapsedBeforePause = 0;
    timerInterval = setInterval(() => {
        timerEl.textContent = formatTime(elapsedBeforePause + performance.now() - startTime);
    }, 100);
}

function pauseTimer() {
    elapsedBeforePause += performance.now() - startTime;
    clearInterval(timerInterval);
    timerInterval = null;
}

function resumeTimer() {
    startTime = performance.now();
    timerInterval = setInterval(() => {
        timerEl.textContent = formatTime(elapsedBeforePause + performance.now() - startTime);
    }, 100);
}

function stopTimer() {
    elapsedBeforePause += performance.now() - startTime;
    clearInterval(timerInterval);
    timerInterval = null;
}

function totalElapsed() {
    return elapsedBeforePause;
}

function updateProgress() {
    progressEl.textContent = `${correctCount} / ${ROUND_SIZE}`;
}

let nextBtnReady = false;

function showNextBtn(wrong) {
    nextBtnReady = false;
    nextBtn.classList.toggle('wrong', !!wrong);
    nextBtn.classList.add('visible');
    pauseTimer();
    setTimeout(() => { nextBtnReady = true; }, 200);
}

function hideNextBtn() {
    nextBtn.classList.remove('visible', 'wrong');
    nextBtnReady = false;
    if (gameStarted && !roundOver) resumeTimer();
}

function confirmedHtml() {
    return confirmedNotes.map(n => `<span class="result correct">${n} &#10003;</span>`).join(' ');
}

function handleGuess(guess) {
    const expected = currentNotes[guessIndex];

    if (guess === expected) {
        confirmedNotes.push(guess);
        guessIndex++;
        render();

        if (guessIndex < currentNotes.length) {
            // Still more notes to guess
            const left = currentNotes.length - guessIndex;
            feedbackEl.innerHTML = `${confirmedHtml()}
               <div class="answer">${left} note${left > 1 ? 's' : ''} left</div>`;
            scrollToMiddleC();
            return;
        }

        // All notes guessed correctly
        totalGuesses++;
        correctCount++;
        updateProgress();

        if (correctCount >= ROUND_SIZE) {
            feedbackEl.innerHTML = confirmedHtml();
            showSummary();
            return;
        }

        feedbackEl.innerHTML = confirmedHtml();
        guessed = true;
        scrollToMiddleC();
        showNextBtn(false);
    } else {
        // Wrong guess - whole turn fails
        totalGuesses++;
        if (correctCount > 0) correctCount--;
        updateProgress();
        guessed = true;
        const expectedStr = currentNotes.join(', ');
        feedbackEl.innerHTML = `${confirmedHtml()}
           <span class="result incorrect">${guess} &#10007;</span>
           <div class="answer">The notes were ${expectedStr}</div>`;
        scrollToMiddleC();
        showNextBtn(true);
    }
}

function clearFeedback() {
    feedbackEl.innerHTML = '';
}

function showSummary() {
    roundOver = true;
    stopTimer();
    const elapsedMs = totalElapsed();
    const accuracy = Math.round((ROUND_SIZE / totalGuesses) * 100);

    summaryTimeEl.innerHTML = `Time: <strong>${formatTime(elapsedMs)}</strong>`;
    summaryAccuracyEl.innerHTML = `Accuracy: <strong>${accuracy}%</strong> (${ROUND_SIZE}/${totalGuesses})`;

    const hs = loadHighscore();
    let isNewBest = false;
    if (!hs || elapsedMs < hs.ms) {
        isNewBest = true;
        saveHighscore({ ms: elapsedMs });
    }

    const best = loadHighscore();
    summaryBestEl.innerHTML = `Best time: ${formatTime(best.ms)}`;

    if (isNewBest) {
        newBestEl.textContent = 'New Best Time!';
        newBestEl.style.display = '';
    } else {
        newBestEl.style.display = 'none';
    }

    summaryEl.classList.add('visible');
    displayHighscore();
}

const startPanel = document.getElementById('startPanel');
const hudEl = document.querySelector('.hud');

function showStartScreen() {
    correctCount = 0;
    totalGuesses = 0;
    guessed = false;
    roundOver = false;
    gameStarted = false;
    summaryEl.classList.remove('visible');
    hideNextBtn();
    clearFeedback();
    timerEl.textContent = '0.0s';
    hudEl.style.display = 'none';
    canvas.parentElement.style.display = 'none';
    startPanel.classList.add('visible');
}

// Persist settings
const SETTINGS_STORAGE_KEY = 'sightReadingSettings';

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
        if (saved) {
            if (saved.clef) {
                document.querySelectorAll('.clef-btns button').forEach(b => {
                    b.classList.toggle('selected', b.dataset.clef === saved.clef);
                });
            }
            if (saved.noteCount >= 1 && saved.noteCount <= 4) {
                document.querySelectorAll('.note-count-btns button').forEach(b => {
                    b.classList.toggle('selected', parseInt(b.dataset.count) === saved.noteCount);
                });
            }
            if (saved.enabledNotes && Array.isArray(saved.enabledNotes)) {
                document.querySelectorAll('.note-toggle-btns button').forEach(b => {
                    b.classList.toggle('selected', saved.enabledNotes.includes(b.dataset.noteToggle));
                });
            }
        }
    } catch {}
}

function saveSettings() {
    const clefSel = document.querySelector('.clef-btns button.selected');
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        clef: clefSel ? clefSel.dataset.clef : 'both',
        noteCount: currentNoteCount(),
        enabledNotes: currentEnabledNotes()
    }));
}

loadSettings();

// Segmented button handling for both groups
function initSegmentedButtons(selector) {
    document.querySelectorAll(`${selector} button`).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(`${selector} button`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            saveSettings();
            displayHighscore();
        });
    });
}

initSegmentedButtons('.clef-btns');
initSegmentedButtons('.note-count-btns');

// Note toggle buttons — each independently toggleable
document.querySelectorAll('.note-toggle-btns button').forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedCount = document.querySelectorAll('.note-toggle-btns button.selected').length;
        // Don't allow deselecting the last note
        if (btn.classList.contains('selected') && selectedCount <= 1) return;
        btn.classList.toggle('selected');
        saveSettings();
        displayHighscore();
    });
});

function startGame() {
    enabledClefs = currentClefSelection();
    noteCount = currentNoteCount();
    enabledNoteLetters = currentEnabledNotes();
    startPanel.classList.remove('visible');
    hudEl.style.display = '';
    canvas.parentElement.style.display = '';
    gameStarted = true;
    displayHighscore();
    updateProgress();
    nextRound();
    startTimer();
}

function nextRound() {
    currentClef = enabledClefs[Math.floor(Math.random() * enabledClefs.length)];
    currentNotes = randomNotes(currentClef, noteCount);
    guessIndex = 0;
    confirmedNotes = [];
    guessed = false;
    clearFeedback();
    render();
    scrollToMiddleC();
}

function render() {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);
    const staffTop = drawStaff(w, h);
    if (!gameStarted) return;
    if (currentClef === 'treble') {
        drawTrebleClef(staffTop);
    } else {
        drawBassClef(staffTop);
    }
    if (currentNotes.length > 0) {
        drawNotes(currentNotes, currentClef, w, staffTop);
    }
}

// Piano key handling
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('pointerdown', e => {
        e.preventDefault();
        key.classList.add('active');
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playNote(key.dataset.note);
        if (roundOver || !gameStarted || guessed) return;

        handleGuess(key.dataset.note);
    });
    key.addEventListener('pointerup', () => key.classList.remove('active'));
    key.addEventListener('pointerleave', () => key.classList.remove('active'));
});

nextBtn.addEventListener('click', () => {
    if (!nextBtnReady) return;
    hideNextBtn();
    nextRound();
});

startBtn.addEventListener('click', startGame);
document.getElementById('playAgain').addEventListener('click', showStartScreen);

// Start
displayHighscore();
showStartScreen();
scrollToMiddleC();
window.addEventListener('resize', () => { render(); scrollToMiddleC(); });
