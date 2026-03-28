import { encode, decode } from './codon64.js';

/* Textarea Resize Matching */

const textareas = [
    document.getElementById('plaintext'),
    document.getElementById('ciphertext')
];

const observer = new ResizeObserver(entries => {
    const height = entries[0].target.style.height;
    textareas.forEach(t => t.style.height = height);
});

textareas.forEach(t => observer.observe(t));

/* Encode/Decode Functions */

const plaintext = document.getElementById('plaintext');
const ciphertext = document.getElementById('ciphertext');
const password = document.getElementById('password');

document.getElementById('encode').addEventListener('click', () => {
    let output = encode(plaintext.value, password.value);
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