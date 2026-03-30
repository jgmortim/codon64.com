/**
 * @fileoverview The actual Codon64 encoding and decoding functions.
 */

const DNA_CODONS = [
    "AAA", "AAC", "AAG", "AAT", "ACA", "ACC", "ACG", "ACT", "AGA", "AGC", "AGG", "AGT", "ATA", "ATC", "ATG", "ATT",
    "CAA", "CAC", "CAG", "CAT", "CCA", "CCC", "CCG", "CCT", "CGA", "CGC", "CGG", "CGT", "CTA", "CTC", "CTG", "CTT",
    "GAA", "GAC", "GAG", "GAT", "GCA", "GCC", "GCG", "GCT", "GGA", "GGC", "GGG", "GGT", "GTA", "GTC", "GTG", "GTT",
    "TAA", "TAC", "TAG", "TAT", "TCA", "TCC", "TCG", "TCT", "TGA", "TGC", "TGG", "TGT", "TTA", "TTC", "TTG", "TTT"
];

const RNA_CODONS = [
    "AAA", "AAC", "AAG", "AAU", "ACA", "ACC", "ACG", "ACU", "AGA", "AGC", "AGG", "AGU", "AUA", "AUC", "AUG", "AUU",
    "CAA", "CAC", "CAG", "CAU", "CCA", "CCC", "CCG", "CCU", "CGA", "CGC", "CGG", "CGU", "CUA", "CUC", "CUG", "CUU",
    "GAA", "GAC", "GAG", "GAU", "GCA", "GCC", "GCG", "GCU", "GGA", "GGC", "GGG", "GGU", "GUA", "GUC", "GUG", "GUU",
    "UAA", "UAC", "UAG", "UAU", "UCA", "UCC", "UCG", "UCU", "UGA", "UGC", "UGG", "UGU", "UUA", "UUC", "UUG", "UUU"
];

const PASSWORD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const PASSWORD_REGEX = /[^A-Za-z\d\/+]/g;

const EIGHT_BIT_MASK = 0xFF;
const SIX_BIT_MASK = 0x3F;

// UTF-8 encoder/decoder
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Retrieves the correct shift amount for given index in the given password.
 *
 * @param {string} password  The password.
 * @param {number} charIndex The index in the password.
 * @returns {number} The shift amount.
 */
function getShift(password, charIndex) {
    if (password === '') {
        return 0;
    } else {
        const passwordChar = password[charIndex % password.length];
        return PASSWORD_ALPHABET.indexOf(passwordChar);
    }
}

/**
 * Removes any invalid characters from the password.
 *
 * @param {string} password The password to clean.
 * @returns {string} The clean password.
 */
function cleanPassword(password) {
    return password.replaceAll(PASSWORD_REGEX, '')
}

/**
 * Encodes the given input with the given password.
 *
 * @param {string} input     The text to encode.
 * @param {string} password  The password for the encoding. No password is treated the same using just "A".
 * @param {boolean} noSpaces True if the return value should have no spaces between codons.
 * @param {boolean} rna      If true, RNA codons will be used instead of DNA codons.
 * @returns {string} The encoded text.
 */
export function encode(input, password, noSpaces, rna) {
    let key = cleanPassword(password);
    let codonSet = rna ? RNA_CODONS : DNA_CODONS;

    const bytes = encoder.encode(input);
    const encodedCodons = [];

    let bitBuffer = 0;
    let bitCount = 0;

    for (const b of bytes) {
        bitBuffer = (bitBuffer << 8) | (b & EIGHT_BIT_MASK);
        bitCount += 8;

        while (bitCount >= 6) {
            bitCount -= 6;
            const plainBits = (bitBuffer >> bitCount) & SIX_BIT_MASK;
            const shift = getShift(key, encodedCodons.length);
            const encodedBits = (plainBits + shift) % 64;
            encodedCodons.push(codonSet[encodedBits]);
        }
    }

    // Handle remaining bits (pad with zeros)
    if (bitCount > 0) {
        const plainBits = (bitBuffer << (6 - bitCount)) & SIX_BIT_MASK;
        const shift = getShift(key, encodedCodons.length);
        const encodedBits = (plainBits + shift) % 64;
        encodedCodons.push(codonSet[encodedBits]);
    }

    // It takes 4 codons to get an integer number of bytes, if the number of codons isn't a multiple of 4, pad the message
    // with "=" to make output length a multiple of 4.
    const mod = encodedCodons.length % 4;
    if (mod !== 0) {
        for (let i = 0; i < 4 - mod; i++) {
            encodedCodons.push("=");
        }
    }

    return encodedCodons.join(noSpaces ? " " : "");
}

/**
 * Decodes the given input with the given password.
 *
 * @param {string} input    The text to decode.
 * @param {string} password The password for the decoding. No password is treated the same using just "A".
 * @returns {string} The decoded text.
 */
export function decode(input, password) {
    let key = cleanPassword(password);
    let codonSet = input.includes("T") ? DNA_CODONS : RNA_CODONS;

    // Remove spaces and split on every third character.
    const inputCodons = input.replaceAll(/ /g, '').match(/.{1,3}/g);
    let plaintextBytes = [];

    for (let i = 0; i < inputCodons?.length; i += 4) { // i indexes over 4 codon (3 byte) blocks.
        let buffer = 0;
        let numberOfValidCodons = 0;

        // Concatenate up to four 6-bit values.
        for (let j = 0; j < 4 && i + j < inputCodons.length; j++) { // j indexes within the 4 codon (3 byte) blocks.
            const codon = inputCodons[i + j];
            const encodedBits = codonSet.indexOf(codon);

            if (encodedBits === -1) {
                break; // Codon was actually padding; ignore it.
            }

            const shift = getShift(key, i + j);
            const plainBits = ((encodedBits - shift) % 64 + 64) % 64;
            buffer = (buffer << 6) | plainBits;
            numberOfValidCodons++;
        }

        if (numberOfValidCodons === 0) continue;

        const numberOfBits = numberOfValidCodons * 6;
        const numberOfBytes = Math.floor(numberOfBits / 8);

        const extraBits = numberOfBits % 8;
        if (extraBits !== 0) {
            buffer >>= extraBits;  // Shift off any extra bits.
        }

        for (let b = 0; b < numberOfBytes; b++) {
            const shift = (numberOfBytes - 1 - b) * 8;
            const byte = (buffer >> shift) & EIGHT_BIT_MASK; // Shift and mask the buffer to extract the target byte.
            plaintextBytes.push(byte);
        }
    }

    return decoder.decode(new Uint8Array(plaintextBytes));
}