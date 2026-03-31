/**
 * @fileoverview Creates the faint text "texture" in the background of the site.
 */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const TEXT = "AGAAAGAAAGAAAGAAAGAAAGAAAGTTCGAAAGTTCCTAAGTTCGAAAGTAAGTGAAGGAGAAAGAACCTTCCTTCCTTAGCTCGAAAGAAAGAAAGAAAGAAAGAAAGAAAGAACCTAAGTTCGAAAGTAAGTGAGTGCCTACCTAAGTTAGTTCCTTAAGGAGAAAGTTAGAACGTTAGAACGAAAGTCATGTAGAAAGAAAGTGAGAAAGTGAGAAAGAAAGAACCTTCCTTCCTTAGTCAGTCAGTCAGTCAGCTAGCTAAGGAGAACTTAAGAAAGAAAGTGAGTCAGTCAGCTAGAAAGAAAGAAATGGATGGAGAAATGGAGCTAAGGAGAAAGAACCTAAGAAAGCTAGTGAGAAAGTAAGAAAGAACTTAAGTGCTTAAGAACTTAAAGGAGAAAGAAAGAACTTAAGAACTTAAGAACTTAAGAACTTAAGAAAGCTAGTCCTTACCTTCTTAAAGGAGAAAGAACTTACCTTCTTAAGAAAGAACTTACCTTCTTAAAGGCATCCGCCCGCCCTCAAGAACTCACGGCCGTGCTGCAGAACCAACGCCCGCTCGCTCTGCAAGGAGAACTCACGGACGCCAGAACTCACGGCCGTGCTGCAGAACCATCTCACGCCCGCTCGTTCTATCGACCTCCCTAGCTCCCTAT";

/**
 * Redraws the canvas on page resize.
 */
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

/**
 * Break text into fixed-size chunks.
 *
 * @param {string} text The test to break-up.
 * @param {number} size Number of characters per chunk.
 * @returns {string[]} The text chunks.
 */
function chunkText(text, size) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

/**
 * Draws the "texture" text on the background canvas.
 */
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