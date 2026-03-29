import { encode, decode } from './codon64.js';

const plaintext = document.getElementById('plaintext');
const ciphertext = document.getElementById('ciphertext');
const password = document.getElementById('password');
const spaces = document.getElementById('spaces');
const textareas = [
    document.getElementById('plaintext'),
    document.getElementById('ciphertext')
];

/* Textarea Resize Matching */

const observer = new ResizeObserver(entries => {
    const height = entries[0].target.style.height;
    textareas.forEach(t => t.style.height = height);
});

textareas.forEach(t => observer.observe(t));

/* Encode/Decode Functions */

document.getElementById('encode').addEventListener('click', () => {
    let output = encode(plaintext.value, password.value, spaces.checked);
    highlight(ciphertext);
    ciphertext.value = output;
});

document.getElementById('decode').addEventListener('click', () => {
    let output = decode(ciphertext.value, password.value);
    highlight(plaintext);
    plaintext.value = output;
});

function highlight(el) {
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 1000);
}

/* Reformat existing ciphertext if checkbox is changed. */

spaces.addEventListener('click', () => {
    if (spaces.checked) {
        ciphertext.value = ciphertext.value.replace(/(.{3})/g,"$1 ").replace('==', '= =');
    } else {
        ciphertext.value = ciphertext.value.replaceAll(/ /g, '');
    }
});

/* Background canvas with Easter egg text */

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const TEXT = "AGAAAGAAAGAAAGAAAGAACCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTAAGGAGAAAGAAAGAAAGAAAGTTAGAAAGAAAGAAAGTTAGAAAGAAAGTTAGAAAGAAAGAAAGTTAGAAAGTTAGAAAGTTAGAAAGAAAGAAAGAACCTAAAGGAGAAAGAAAGAAAGTTAGAAAGAAAGAAAGTTAGAAAGAAAGTTAGAAAGAAAGAAAGTTAGAAAGTTAGAAAGTTAGAAAGAAAGAAAGAAAGTTAGTTAAGGAGAAAGAAAGTTAGAAAGAAAGAAAGCTAGTCAGTCAGCTAGTCAGTCAGTCAGTCAGTCAGTCAGTCTAAGGTCAAGAAAGAAAGAAAGAAAGTTAGTTAAGGAGAAAGTTAGAAAGAAAGAAAGAAAGTAATTCATTCATTCATTCATTCATTCATTCATTCATTCATTCAGTAAGAAAGAAAGAAAGTTAGTTAAGGAGTTAGAAAGAAAGAAAGAAAGTTAGAACAATCATTCACACATTCATGAGAAATCGATCAAGAAAGAAAGTTAGAAAGAAAGTTAGTTAAGGTAAGGGCGCCTTCCTTCCTTAGTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTAGTTCCTTCCTTAGTTAGTTAAGGAGCTATTCATTCAGTCCCTACCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTTCCTAATTCATTCTAAGGTCAA=";

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

// Break text into fixed-size chunks
function chunkText(text, size) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "16px monospace";
    ctx.fillStyle = "rgba(0,0,0,0.04)";

    const chunkSize = 28;
    const lineHeight = 20;

    const chunks = chunkText(TEXT, chunkSize);

    // Measure actual width of the widest line
    let maxWidth = 0;
    for (const chunk of chunks) {
        const w = ctx.measureText(chunk).width;
        if (w > maxWidth) maxWidth = w;
    }

    const tileWidth = maxWidth;
    const tileHeight = chunks.length * lineHeight;

    for (let y = 0; y < canvas.height; y += tileHeight) {
        for (let x = 0; x < canvas.width; x += tileWidth) {

            chunks.forEach((chunk, i) => {
                ctx.fillText(chunk, x, y + i * lineHeight);
            });

        }
    }
}

window.addEventListener("resize", resize);
resize();