const CODONS = [
    "AAA", "AAC", "AAG", "AAT",
    "ACA", "ACC", "ACG", "ACT",
    "AGA", "AGC", "AGG", "AGT",
    "ATA", "ATC", "ATG", "ATT",
    "CAA", "CAC", "CAG", "CAT",
    "CCA", "CCC", "CCG", "CCT",
    "CGA", "CGC", "CGG", "CGT",
    "CTA", "CTC", "CTG", "CTT",
    "GAA", "GAC", "GAG", "GAT",
    "GCA", "GCC", "GCG", "GCT",
    "GGA", "GGC", "GGG", "GGT",
    "GTA", "GTC", "GTG", "GTT",
    "TAA", "TAC", "TAG", "TAT",
    "TCA", "TCC", "TCG", "TCT",
    "TGA", "TGC", "TGG", "TGT",
    "TTA", "TTC", "TTG", "TTT",
];

const PASSWORD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const PASSWORD_REGEX = /[^A-Za-z\d\/\+]/g;

const EIGHT_BIT_MASK = 0xFF;
const SIX_BIT_MASK = 0x3F;

// UTF-8 encoder/decoder
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getShift(password, charIndex) {
    if (password === '') {
        return 0;
    } else {
        const passwordChar = password[charIndex % password.length];
        return PASSWORD_ALPHABET.indexOf(passwordChar);
    }
}

function cleanPassword(password) {
    return password.replaceAll(PASSWORD_REGEX, '')
}

export function encode(input, pass, noSpaces) {
    let password = cleanPassword(pass);

    const bytes = encoder.encode(input);
    const encodedCodons = [];

    let bitBuffer = 0;
    let bitCount = 0;
    let codonCount = 0;

    for (const b of bytes) {
        bitBuffer = (bitBuffer << 8) | (b & EIGHT_BIT_MASK);
        bitCount += 8;

        while (bitCount >= 6) {
            bitCount -= 6;
            const plainBits = (bitBuffer >> bitCount) & SIX_BIT_MASK;
            const shift = getShift(password, codonCount);
            const encodedBits = (plainBits + shift) % 64;
            encodedCodons.push(CODONS[encodedBits]);
            codonCount++;
        }
    }

    // remaining bits
    if (bitCount > 0) {
        const plainBits = (bitBuffer << (6 - bitCount)) & SIX_BIT_MASK;
        const shift = getShift(password, codonCount);
        const encodedBits = (plainBits + shift) % 64;
        encodedCodons.push(CODONS[encodedBits]);
        codonCount++;
    }

    // padding to multiple of 4
    const mod = codonCount % 4;
    if (mod !== 0) {
        for (let i = 0; i < 4 - mod; i++) {
            encodedCodons.push("=");
        }
    }

    return encodedCodons.join(noSpaces ? " " : "");
}

export function decode(input, pass) {
    let password = cleanPassword(pass);

    const inputCodons = input.split(" ");
    let plaintextBytes = [];

    for (let i = 0; i < inputCodons.length; i += 4) {
        let buffer = 0;
        let numberOfValidCodons = 0;

        for (let j = 0; j < 4 && i + j < inputCodons.length; j++) {
            const codon = inputCodons[i + j];
            const encodedBits = CODONS.indexOf(codon);

            if (encodedBits === -1) break; // padding

            const shift = getShift(password, i + j);
            const plainBits = ((encodedBits - shift) % 64 + 64) % 64; // floorMod
            buffer = (buffer << 6) | plainBits;
            numberOfValidCodons++;
        }

        if (numberOfValidCodons === 0) continue;

        const numberOfBits = numberOfValidCodons * 6;
        const numberOfBytes = Math.floor(numberOfBits / 8);

        const extraBits = numberOfBits % 8;
        if (extraBits !== 0) {
            buffer >>= extraBits;
        }

        for (let b = 0; b < numberOfBytes; b++) {
            const shift = (numberOfBytes - 1 - b) * 8;
            const byte = (buffer >> shift) & 0xFF;
            plaintextBytes.push(byte);
        }
    }

    return decoder.decode(new Uint8Array(plaintextBytes));
}