/* ============================================
   CryptoCalc — Cipher Implementations & UI Logic
   ============================================ */

// ===========================
// UI LOGIC
// ===========================

// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.cipher-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('panel-' + target).classList.add('active');
        });
    });

    // Initialize Hill matrix (2x2)
    setHillSize(2);

    // Initialize Enigma rotor selectors
    initEnigmaRotors();

    // Initialize Playfair matrix display
    updatePlayfairMatrix();
    document.getElementById('playfair-key').addEventListener('input', updatePlayfairMatrix);
});

// Copy to clipboard
function copyOutput(id) {
    const el = document.getElementById(id);
    if (!el.value) return;
    navigator.clipboard.writeText(el.value).then(() => {
        showToast('Teks berhasil disalin!');
    });
}

// Toast notification
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Clear fields
function clearFields(cipher) {
    const ids = {
        vigenere: ['vigenere-key', 'vigenere-input', 'vigenere-output'],
        affine: ['affine-a', 'affine-b', 'affine-input', 'affine-output'],
        playfair: ['playfair-key', 'playfair-input', 'playfair-output'],
        hill: ['hill-input', 'hill-output'],
        enigma: ['enigma-input', 'enigma-output']
    };
    ids[cipher].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    if (cipher === 'hill') {
        document.querySelectorAll('#hill-matrix input').forEach(inp => inp.value = '');
    }
    if (cipher === 'enigma') {
        document.getElementById('enigma-r1').value = 'A';
        document.getElementById('enigma-r2').value = 'A';
        document.getElementById('enigma-r3').value = 'A';
    }
    if (cipher === 'playfair') {
        updatePlayfairMatrix();
    }
    // Reset file input
    const fileInput = document.getElementById(cipher + '-file');
    if (fileInput) fileInput.value = '';
    const fileInfo = document.getElementById(cipher + '-file-info');
    if (fileInfo) { fileInfo.classList.remove('show'); fileInfo.innerHTML = ''; }
    if (typeof fileData !== 'undefined') fileData[cipher] = null;
}

// Show error in output
function showError(outputId, msg) {
    document.getElementById(outputId).value = '⚠ Error: ' + msg;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function mod(n, m) {
    return ((n % m) + m) % m;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Extended Euclidean Algorithm — returns modular inverse of a mod m
function modInverse(a, m) {
    a = mod(a, m);
    for (let x = 1; x < m; x++) {
        if (mod(a * x, m) === 1) return x;
    }
    return -1; // no inverse
}

// ===========================
// 1. VIGENERE CIPHER
// ===========================

function vigenereProcess(text, key, decrypt) {
    if (!key || !/^[a-zA-Z]+$/.test(key)) {
        return { error: 'Kata kunci harus berisi huruf alfabet (A-Z) saja.' };
    }
    key = key.toUpperCase();
    let result = '';
    let ki = 0;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (/[a-zA-Z]/.test(c)) {
            const isUpper = c === c.toUpperCase();
            const p = c.toUpperCase().charCodeAt(0) - 65;
            const k = key.charCodeAt(ki % key.length) - 65;
            let shifted;
            if (decrypt) {
                shifted = mod(p - k, 26);
            } else {
                shifted = mod(p + k, 26);
            }
            const ch = String.fromCharCode(shifted + 65);
            result += isUpper ? ch : ch.toLowerCase();
            ki++;
        } else {
            result += c; // preserve non-alpha characters
        }
    }
    return { result };
}

function vigenereEncrypt() {
    const key = document.getElementById('vigenere-key').value;
    const input = document.getElementById('vigenere-input').value;
    if (!input) return showError('vigenere-output', 'Masukkan teks!');
    const res = vigenereProcess(input, key, false);
    if (res.error) return showError('vigenere-output', res.error);
    document.getElementById('vigenere-output').value = res.result;
}

function vigenereDecrypt() {
    const key = document.getElementById('vigenere-key').value;
    const input = document.getElementById('vigenere-input').value;
    if (!input) return showError('vigenere-output', 'Masukkan teks!');
    const res = vigenereProcess(input, key, true);
    if (res.error) return showError('vigenere-output', res.error);
    document.getElementById('vigenere-output').value = res.result;
}

// ===========================
// 2. AFFINE CIPHER
// ===========================

function affineProcess(text, a, b, decrypt) {
    if (isNaN(a) || isNaN(b)) {
        return { error: 'Masukkan nilai kunci a dan b.' };
    }
    if (gcd(a, 26) !== 1) {
        return { error: 'Kunci a harus coprime dengan 26. Nilai valid: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25.' };
    }

    let result = '';
    const aInv = modInverse(a, 26);

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (/[a-zA-Z]/.test(c)) {
            const isUpper = c === c.toUpperCase();
            const x = c.toUpperCase().charCodeAt(0) - 65;
            let val;
            if (decrypt) {
                val = mod(aInv * (x - b), 26);
            } else {
                val = mod(a * x + b, 26);
            }
            const ch = String.fromCharCode(val + 65);
            result += isUpper ? ch : ch.toLowerCase();
        } else {
            result += c;
        }
    }
    return { result };
}

function affineEncrypt() {
    const a = parseInt(document.getElementById('affine-a').value);
    const b = parseInt(document.getElementById('affine-b').value);
    const input = document.getElementById('affine-input').value;
    if (!input) return showError('affine-output', 'Masukkan teks!');
    const res = affineProcess(input, a, b, false);
    if (res.error) return showError('affine-output', res.error);
    document.getElementById('affine-output').value = res.result;
}

function affineDecrypt() {
    const a = parseInt(document.getElementById('affine-a').value);
    const b = parseInt(document.getElementById('affine-b').value);
    const input = document.getElementById('affine-input').value;
    if (!input) return showError('affine-output', 'Masukkan teks!');
    const res = affineProcess(input, a, b, true);
    if (res.error) return showError('affine-output', res.error);
    document.getElementById('affine-output').value = res.result;
}

// ===========================
// 3. PLAYFAIR CIPHER
// ===========================

function buildPlayfairMatrix(key) {
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const seen = new Set();
    const matrix = [];

    for (const ch of key) {
        if (!seen.has(ch)) {
            seen.add(ch);
            matrix.push(ch);
        }
    }
    for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(65 + i);
        if (ch === 'J') continue;
        if (!seen.has(ch)) {
            seen.add(ch);
            matrix.push(ch);
        }
    }
    return matrix; // 25-element array, row = Math.floor(i/5), col = i%5
}

function findInMatrix(matrix, ch) {
    const idx = matrix.indexOf(ch);
    return { row: Math.floor(idx / 5), col: idx % 5 };
}

function preparePlayfairText(text) {
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    // Split into digraphs, inserting X between duplicates
    let prepared = '';
    let i = 0;
    while (i < text.length) {
        prepared += text[i];
        if (i + 1 < text.length) {
            if (text[i] === text[i + 1]) {
                prepared += 'X';
            } else {
                prepared += text[i + 1];
                i++;
            }
        }
        i++;
    }
    // Pad with X if odd
    if (prepared.length % 2 !== 0) {
        prepared += 'X';
    }
    return prepared;
}

function playfairCipher(text, key, decrypt) {
    if (!key || !/[a-zA-Z]/.test(key)) {
        return { error: 'Masukkan kata kunci yang valid (huruf alfabet).' };
    }

    const matrix = buildPlayfairMatrix(key);
    let prepared;
    if (decrypt) {
        prepared = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        if (prepared.length % 2 !== 0) prepared += 'X';
    } else {
        prepared = preparePlayfairText(text);
    }

    let result = '';
    const shift = decrypt ? -1 : 1;

    for (let i = 0; i < prepared.length; i += 2) {
        const a = findInMatrix(matrix, prepared[i]);
        const b = findInMatrix(matrix, prepared[i + 1]);

        let newA, newB;

        if (a.row === b.row) {
            // Same row — shift columns
            newA = matrix[a.row * 5 + mod(a.col + shift, 5)];
            newB = matrix[b.row * 5 + mod(b.col + shift, 5)];
        } else if (a.col === b.col) {
            // Same column — shift rows
            newA = matrix[mod(a.row + shift, 5) * 5 + a.col];
            newB = matrix[mod(b.row + shift, 5) * 5 + b.col];
        } else {
            // Rectangle — swap columns
            newA = matrix[a.row * 5 + b.col];
            newB = matrix[b.row * 5 + a.col];
        }

        result += newA + newB;
    }
    return { result, prepared };
}

function updatePlayfairMatrix() {
    const key = document.getElementById('playfair-key').value || '';
    const matrix = buildPlayfairMatrix(key);
    const grid = document.getElementById('playfair-matrix-grid');
    grid.innerHTML = '';
    matrix.forEach(ch => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = ch;
        grid.appendChild(cell);
    });
}

function playfairEncrypt() {
    const key = document.getElementById('playfair-key').value;
    const input = document.getElementById('playfair-input').value;
    if (!input) return showError('playfair-output', 'Masukkan teks!');
    const res = playfairCipher(input, key, false);
    if (res.error) return showError('playfair-output', res.error);
    document.getElementById('playfair-output').value = res.result;
}

function playfairDecrypt() {
    const key = document.getElementById('playfair-key').value;
    const input = document.getElementById('playfair-input').value;
    if (!input) return showError('playfair-output', 'Masukkan teks!');
    const res = playfairCipher(input, key, true);
    if (res.error) return showError('playfair-output', res.error);
    document.getElementById('playfair-output').value = res.result;
}

// ===========================
// 4. HILL CIPHER
// ===========================

let hillSize = 2;

function setHillSize(size) {
    hillSize = size;
    const container = document.getElementById('hill-matrix');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size}, 60px)`;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.id = `hill-k-${r}-${c}`;
            inp.placeholder = `k${r}${c}`;
            inp.min = 0;
            inp.max = 25;
            container.appendChild(inp);
        }
    }

    // Toggle buttons
    document.getElementById('hill-size-2').classList.toggle('active', size === 2);
    document.getElementById('hill-size-3').classList.toggle('active', size === 3);
}

function getHillMatrix() {
    const matrix = [];
    for (let r = 0; r < hillSize; r++) {
        const row = [];
        for (let c = 0; c < hillSize; c++) {
            const val = parseInt(document.getElementById(`hill-k-${r}-${c}`).value);
            if (isNaN(val)) return null;
            row.push(val);
        }
        matrix.push(row);
    }
    return matrix;
}

function matDet2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function matDet3(m) {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function matInverse2(m) {
    const det = mod(matDet2(m), 26);
    if (gcd(det, 26) !== 1) return null;
    const detInv = modInverse(det, 26);
    return [
        [mod(detInv * m[1][1], 26), mod(detInv * (-m[0][1]), 26)],
        [mod(detInv * (-m[1][0]), 26), mod(detInv * m[0][0], 26)]
    ];
}

function matInverse3(m) {
    const det = mod(matDet3(m), 26);
    if (gcd(det, 26) !== 1) return null;
    const detInv = modInverse(det, 26);

    // Cofactor matrix
    const cofactor = [];
    for (let r = 0; r < 3; r++) {
        cofactor.push([]);
        for (let c = 0; c < 3; c++) {
            // Minor for (r,c)
            const minor = [];
            for (let i = 0; i < 3; i++) {
                if (i === r) continue;
                const row = [];
                for (let j = 0; j < 3; j++) {
                    if (j === c) continue;
                    row.push(m[i][j]);
                }
                minor.push(row);
            }
            const minorDet = minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0];
            const sign = ((r + c) % 2 === 0) ? 1 : -1;
            cofactor[r].push(sign * minorDet);
        }
    }

    // Adjugate = transpose of cofactor
    const adj = [
        [cofactor[0][0], cofactor[1][0], cofactor[2][0]],
        [cofactor[0][1], cofactor[1][1], cofactor[2][1]],
        [cofactor[0][2], cofactor[1][2], cofactor[2][2]]
    ];

    // Multiply by detInv mod 26
    const inv = [];
    for (let r = 0; r < 3; r++) {
        inv.push([]);
        for (let c = 0; c < 3; c++) {
            inv[r].push(mod(detInv * adj[r][c], 26));
        }
    }
    return inv;
}

function matMultiplyVector(matrix, vector, size) {
    const result = [];
    for (let r = 0; r < size; r++) {
        let sum = 0;
        for (let c = 0; c < size; c++) {
            sum += matrix[r][c] * vector[c];
        }
        result.push(mod(sum, 26));
    }
    return result;
}

function hillProcess(text, matrix, decrypt) {
    const size = matrix.length;

    // Validate matrix
    const det = size === 2 ? matDet2(matrix) : matDet3(matrix);
    if (gcd(mod(det, 26), 26) !== 1) {
        return { error: `Determinan matriks (${mod(det, 26)}) tidak coprime dengan 26. Matriks tidak bisa diinversi. Pilih matriks lain.` };
    }

    // Get the working matrix
    let workMatrix;
    if (decrypt) {
        workMatrix = size === 2 ? matInverse2(matrix) : matInverse3(matrix);
        if (!workMatrix) {
            return { error: 'Tidak dapat menghitung invers matriks mod 26.' };
        }
    } else {
        workMatrix = matrix;
    }

    // Prepare text
    let clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    while (clean.length % size !== 0) {
        clean += 'X'; // padding
    }

    let result = '';
    for (let i = 0; i < clean.length; i += size) {
        const vector = [];
        for (let j = 0; j < size; j++) {
            vector.push(clean.charCodeAt(i + j) - 65);
        }
        const encrypted = matMultiplyVector(workMatrix, vector, size);
        for (let j = 0; j < size; j++) {
            result += String.fromCharCode(encrypted[j] + 65);
        }
    }
    return { result };
}

function hillEncrypt() {
    const input = document.getElementById('hill-input').value;
    if (!input) return showError('hill-output', 'Masukkan teks!');
    const matrix = getHillMatrix();
    if (!matrix) return showError('hill-output', 'Lengkapi semua nilai matriks kunci!');
    const res = hillProcess(input, matrix, false);
    if (res.error) return showError('hill-output', res.error);
    document.getElementById('hill-output').value = res.result;
}

function hillDecrypt() {
    const input = document.getElementById('hill-input').value;
    if (!input) return showError('hill-output', 'Masukkan teks!');
    const matrix = getHillMatrix();
    if (!matrix) return showError('hill-output', 'Lengkapi semua nilai matriks kunci!');
    const res = hillProcess(input, matrix, true);
    if (res.error) return showError('hill-output', res.error);
    document.getElementById('hill-output').value = res.result;
}

// ===========================
// 5. ENIGMA CIPHER
// ===========================

// Historical Enigma I rotor wirings
const ENIGMA_ROTORS = {
    I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
    II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
    III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }
};

const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

class EnigmaRotor {
    constructor(wiring, notch, position) {
        this.wiring = wiring;
        this.notch = notch.charCodeAt(0) - 65;
        this.position = position;
    }

    forward(c) {
        const shifted = mod(c + this.position, 26);
        const out = this.wiring.charCodeAt(shifted) - 65;
        return mod(out - this.position, 26);
    }

    backward(c) {
        const shifted = mod(c + this.position, 26);
        const ch = String.fromCharCode(shifted + 65);
        const out = this.wiring.indexOf(ch);
        return mod(out - this.position, 26);
    }

    isAtNotch() {
        return this.position === this.notch;
    }

    step() {
        this.position = mod(this.position + 1, 26);
    }
}

class EnigmaMachine {
    constructor(pos1, pos2, pos3) {
        // Rotor order: I (left/slow), II (middle), III (right/fast)
        this.rotorLeft = new EnigmaRotor(ENIGMA_ROTORS.I.wiring, ENIGMA_ROTORS.I.notch, pos1);
        this.rotorMiddle = new EnigmaRotor(ENIGMA_ROTORS.II.wiring, ENIGMA_ROTORS.II.notch, pos2);
        this.rotorRight = new EnigmaRotor(ENIGMA_ROTORS.III.wiring, ENIGMA_ROTORS.III.notch, pos3);
        this.reflector = REFLECTOR_B;
    }

    stepRotors() {
        // Double stepping anomaly
        if (this.rotorMiddle.isAtNotch()) {
            this.rotorMiddle.step();
            this.rotorLeft.step();
        } else if (this.rotorRight.isAtNotch()) {
            this.rotorMiddle.step();
        }
        this.rotorRight.step();
    }

    encryptChar(c) {
        // Step rotors before encryption
        this.stepRotors();

        // Forward through rotors: Right → Middle → Left
        let signal = c;
        signal = this.rotorRight.forward(signal);
        signal = this.rotorMiddle.forward(signal);
        signal = this.rotorLeft.forward(signal);

        // Reflector
        signal = this.reflector.charCodeAt(signal) - 65;

        // Backward through rotors: Left → Middle → Right
        signal = this.rotorLeft.backward(signal);
        signal = this.rotorMiddle.backward(signal);
        signal = this.rotorRight.backward(signal);

        return signal;
    }

    process(text) {
        let result = '';
        const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
        for (let i = 0; i < clean.length; i++) {
            const c = clean.charCodeAt(i) - 65;
            const encrypted = this.encryptChar(c);
            result += String.fromCharCode(encrypted + 65);
        }
        return result;
    }
}

function initEnigmaRotors() {
    const selects = ['enigma-r1', 'enigma-r2', 'enigma-r3'];
    selects.forEach(id => {
        const sel = document.getElementById(id);
        for (let i = 0; i < 26; i++) {
            const opt = document.createElement('option');
            opt.value = String.fromCharCode(65 + i);
            opt.textContent = String.fromCharCode(65 + i);
            sel.appendChild(opt);
        }
        sel.value = 'A';
    });
}

function enigmaProcess() {
    const input = getInputText('enigma');
    if (!input) return showError('enigma-output', 'Masukkan teks!');

    const pos1 = document.getElementById('enigma-r1').value.charCodeAt(0) - 65;
    const pos2 = document.getElementById('enigma-r2').value.charCodeAt(0) - 65;
    const pos3 = document.getElementById('enigma-r3').value.charCodeAt(0) - 65;

    const machine = new EnigmaMachine(pos1, pos2, pos3);
    const result = machine.process(input);
    setOutputText('enigma', result);
}

// ===========================
// 6. FILE HANDLING (Base64)
// ===========================

// Store file data per cipher
const fileData = {};
const cipherModes = {};

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Set input mode (text or file)
function setMode(cipher, mode) {
    cipherModes[cipher] = mode;
    const textBtn = document.getElementById(cipher + '-mode-text');
    const fileBtn = document.getElementById(cipher + '-mode-file');
    const textSection = document.getElementById(cipher + '-text-section');
    const fileSection = document.getElementById(cipher + '-file-section');
    const downloadBtn = document.getElementById(cipher + '-download');

    // Get the input and output io-sections inside the grid
    const inputSection = textSection.querySelector('.io-section:first-child');
    const outputSection = textSection.querySelector('.io-section:last-child');

    if (mode === 'file') {
        textBtn.classList.remove('active');
        fileBtn.classList.add('active');
        // Hide only the input textarea, keep output visible
        if (inputSection) inputSection.style.display = 'none';
        textSection.style.gridTemplateColumns = '1fr';
        fileSection.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = '';
    } else {
        textBtn.classList.add('active');
        fileBtn.classList.remove('active');
        // Show both input and output
        if (inputSection) inputSection.style.display = '';
        textSection.style.gridTemplateColumns = '';
        fileSection.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
    }
}

// Handle file upload — convert to Base64 (letters only)
function handleFileUpload(cipher) {
    const fileInput = document.getElementById(cipher + '-file');
    const fileInfo = document.getElementById(cipher + '-file-info');
    const file = fileInput.files[0];

    if (!file) {
        fileInfo.classList.remove('show');
        fileData[cipher] = null;
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);

        // Convert bytes to Base64 string
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        const base64 = btoa(binary);

        // Store original file info
        fileData[cipher] = {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            base64: base64
        };

        // Show file info
        const typeIcon = getFileIcon(file.type);
        fileInfo.innerHTML = `<i class="fas ${typeIcon}"></i> <strong>${file.name}</strong> — ${formatFileSize(file.size)} — Siap diproses (Base64: ${base64.length} karakter)`;
        fileInfo.classList.add('show');

        // Pre-fill input textarea with Base64 for processing
        const inputEl = document.getElementById(cipher + '-input');
        if (inputEl) inputEl.value = base64;
    };
    reader.readAsArrayBuffer(file);
}

// Get file type icon
function getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType.startsWith('audio/')) return 'fa-file-audio';
    if (mimeType.startsWith('video/')) return 'fa-file-video';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'fa-file-word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'fa-file-excel';
    if (mimeType.includes('sql') || mimeType.includes('database')) return 'fa-database';
    return 'fa-file';
}

// Get input text (from textarea or file)
function getInputText(cipher) {
    if (cipherModes[cipher] === 'file') {
        if (fileData[cipher]) {
            return fileData[cipher].base64;
        }
        return '';
    }
    return document.getElementById(cipher + '-input').value;
}

// Set output text
function setOutputText(cipher, text) {
    document.getElementById(cipher + '-output').value = text;
}

// Download encrypted/decrypted result as file
function downloadResult(cipher) {
    const output = document.getElementById(cipher + '-output').value;
    if (!output) {
        showToast('Tidak ada hasil untuk didownload!');
        return;
    }

    let filename, blob;

    // If we have original file data, create an encrypted text file
    if (fileData[cipher]) {
        const origName = fileData[cipher].name;
        filename = origName + '.encrypted.txt';
        blob = new Blob([output], { type: 'text/plain' });
    } else {
        filename = cipher + '_result.txt';
        blob = new Blob([output], { type: 'text/plain' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File berhasil didownload!');
}

// Override cipher functions to support file mode
// Wrap the existing encrypt/decrypt functions

const origVigEncrypt = vigenereEncrypt;
const origVigDecrypt = vigenereDecrypt;

vigenereEncrypt = function () {
    if (cipherModes['vigenere'] === 'file') {
        const input = getInputText('vigenere');
        if (!input) return showError('vigenere-output', 'Upload file terlebih dahulu!');
        const key = document.getElementById('vigenere-key').value;
        const res = vigenereProcess(input, key, false);
        if (res.error) return showError('vigenere-output', res.error);
        setOutputText('vigenere', res.result);
    } else {
        origVigEncrypt();
    }
};

vigenereDecrypt = function () {
    if (cipherModes['vigenere'] === 'file') {
        const input = getInputText('vigenere');
        if (!input) return showError('vigenere-output', 'Upload file terlebih dahulu!');
        const key = document.getElementById('vigenere-key').value;
        const res = vigenereProcess(input, key, true);
        if (res.error) return showError('vigenere-output', res.error);
        setOutputText('vigenere', res.result);
    } else {
        origVigDecrypt();
    }
};

const origAffEncrypt = affineEncrypt;
const origAffDecrypt = affineDecrypt;

affineEncrypt = function () {
    if (cipherModes['affine'] === 'file') {
        const input = getInputText('affine');
        if (!input) return showError('affine-output', 'Upload file terlebih dahulu!');
        const a = parseInt(document.getElementById('affine-a').value);
        const b = parseInt(document.getElementById('affine-b').value);
        const res = affineProcess(input, a, b, false);
        if (res.error) return showError('affine-output', res.error);
        setOutputText('affine', res.result);
    } else {
        origAffEncrypt();
    }
};

affineDecrypt = function () {
    if (cipherModes['affine'] === 'file') {
        const input = getInputText('affine');
        if (!input) return showError('affine-output', 'Upload file terlebih dahulu!');
        const a = parseInt(document.getElementById('affine-a').value);
        const b = parseInt(document.getElementById('affine-b').value);
        const res = affineProcess(input, a, b, true);
        if (res.error) return showError('affine-output', res.error);
        setOutputText('affine', res.result);
    } else {
        origAffDecrypt();
    }
};

const origPfEncrypt = playfairEncrypt;
const origPfDecrypt = playfairDecrypt;

playfairEncrypt = function () {
    if (cipherModes['playfair'] === 'file') {
        const input = getInputText('playfair');
        if (!input) return showError('playfair-output', 'Upload file terlebih dahulu!');
        const key = document.getElementById('playfair-key').value;
        const res = playfairCipher(input, key, false);
        if (res.error) return showError('playfair-output', res.error);
        setOutputText('playfair', res.result);
    } else {
        origPfEncrypt();
    }
};

playfairDecrypt = function () {
    if (cipherModes['playfair'] === 'file') {
        const input = getInputText('playfair');
        if (!input) return showError('playfair-output', 'Upload file terlebih dahulu!');
        const key = document.getElementById('playfair-key').value;
        const res = playfairCipher(input, key, true);
        if (res.error) return showError('playfair-output', res.error);
        setOutputText('playfair', res.result);
    } else {
        origPfDecrypt();
    }
};

const origHillEncrypt = hillEncrypt;
const origHillDecrypt = hillDecrypt;

hillEncrypt = function () {
    if (cipherModes['hill'] === 'file') {
        const input = getInputText('hill');
        if (!input) return showError('hill-output', 'Upload file terlebih dahulu!');
        const matrix = getHillMatrix();
        if (!matrix) return showError('hill-output', 'Lengkapi semua nilai matriks kunci!');
        const res = hillProcess(input, matrix, false);
        if (res.error) return showError('hill-output', res.error);
        setOutputText('hill', res.result);
    } else {
        origHillEncrypt();
    }
};

hillDecrypt = function () {
    if (cipherModes['hill'] === 'file') {
        const input = getInputText('hill');
        if (!input) return showError('hill-output', 'Upload file terlebih dahulu!');
        const matrix = getHillMatrix();
        if (!matrix) return showError('hill-output', 'Lengkapi semua nilai matriks kunci!');
        const res = hillProcess(input, matrix, true);
        if (res.error) return showError('hill-output', res.error);
        setOutputText('hill', res.result);
    } else {
        origHillDecrypt();
    }
};
