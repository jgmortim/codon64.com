/**
 * @fileOverview Event listeners for functions section of the home page.
 */
import { encode, decode } from './codon64.js';

const plaintext = document.getElementById('plaintext');
const ciphertext = document.getElementById('ciphertext');
const password = document.getElementById('password');
const spaces = document.getElementById('spaces');
const rna = document.getElementById('rna');
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

document.getElementById('encode-btn').addEventListener('click', () => {
    let output = encode(plaintext.value, password.value, spaces.checked, rna.checked);
    highlight(ciphertext);
    ciphertext.value = output;
});

document.getElementById('decode-btn').addEventListener('click', () => {
    let output = decode(ciphertext.value, password.value);
    highlight(plaintext);
    plaintext.value = output;
});

function highlight(el) {
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 1000);
}

/* Reformat existing ciphertext if checkboxes are changed. */

spaces.addEventListener('click', () => {
    if (spaces.checked) {
        ciphertext.value = ciphertext.value.replace(/(.{3})/g, "$1 ").replace('==', '= =');
    } else {
        ciphertext.value = ciphertext.value.replaceAll(/ /g, '');
    }
});

rna.addEventListener('click', () => {
    if (rna.checked) {
        ciphertext.value = ciphertext.value.replace(/T/g, "U");
    } else {
        ciphertext.value = ciphertext.value.replaceAll(/U/g, 'T');
    }
});