const textareas = [
    document.getElementById("plaintext"),
    document.getElementById("ciphertext")
];

const observer = new ResizeObserver(entries => {
    const height = entries[0].target.style.height;
    textareas.forEach(t => t.style.height = height);
});

textareas.forEach(t => observer.observe(t));