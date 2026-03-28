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