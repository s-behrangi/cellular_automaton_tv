import { inflate, deflate } from 'pako';

const base64Dict = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

/* ----------------- COMBINATORICS ------------------ */
/* -------------------------------------------------- */
/* -------------------------------------------------- */

export function binomial(n: number, k: number) {
    if (k < 0 || k > n) {
        return 0;
    }

    if (k === 0 || k === n) {
        return 1;
    }

    k = Math.min(k, n - k);

    let result = 1;

    for (let i = 1; i <= k; i++) {
        result *= (n - i + 1) / i;
    }

    return Math.round(result);
}

export function binomialArray(n: number){
    /* generates array of length n*n where arr[k*m + n] is m choose k*/
    const arr = new Uint32Array(n * n);

    for (let m = 0; m < n; m++) {
        for (let k = 0; k < n; k++) {
            arr[k * n + m] = binomial(m, k);
        }
    }

    return arr;
}

export function comboToRank(a: Array<number>, n: number, k: number) {
    /* gives lex ordering on combination with repetition                */
    /* assumes combination is delivered as e.g. [1, 1, 2, 2, 2, 3, 3, 3]*/
    const N = n + k - 1;
    let idx = 0;
    for (let i = 1; i <= k; i++) {
        const c = N - a[i - 1] - i;
        const j = k + 1 - i;
        if (j <= c) {
            idx += binomial(c, j);
        }
    }
    return binomial(N, k) - idx - 1;
}

export function chooseWithRep(n: number, k: number) {
    return binomial(n + k - 1, k);
}

/* ----------------- COLOUR CONTROL ----------------- */
/* -------------------------------------------------- */
/* -------------------------------------------------- */

export function rgbToHSL(rgb: number[]) {
    /* normalize to [0, 1] */
    let r = rgb[0] / 255.0;
    let g = rgb[1] / 255.0;
    let b = rgb[2] / 255.0;

    /* find max and min */
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    /* lightness */
    const l = (max + min) / 2;

    /* saturation */
    const s = (delta === 0) ? 0 : (delta / (1 - Math.abs(2 * l - 1)));

    /* hue */
    const h = (delta === 0) ? 0 : (
              (max == r) ? (60 * (((g - b) / delta) % 6)) : 
              (max == r) ? (60 * (((b - r) / delta) + 2)) : (60 * (((r - g) / delta) + 4)));
    
    /* final conversion */
    return [h, s * 100, l * 100];
}

export function hslToRGB(hsl: number[]) {
    const h = hsl[0];
    const s = hsl[1] / 100.0;
    const l = hsl[2] / 100.0;

    /* chroma */
    const c = (1 - Math.abs(2 * l - 1)) * s;

    /* helper */
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));

    /* temporary rgb triple in [0, c] */
    let rgb = new Array;
    if (0 <= h && h < 60) {
        rgb = [c, x, 0];
    } else if (h < 120) {
        rgb = [x, c, 0];
    } else if (h < 180) {
        rgb = [0, c, x];
    } else if (h < 240) {
        rgb = [0, x, c];
    } else if (h < 300) {
        rgb = [x, 0, c];
    } else {
        rgb = [c, 0, x];
    }

    /* add lightness offset */
    const m = l - c / 2;
    rgb[0] = (rgb[0] + m) * 255;
    rgb[1] = (rgb[1] + m) * 255;
    rgb[2] = (rgb[2] + m) * 255;

    return rgb
}

/* ---------------- (DE)COMPRESSION ----------------- */
/* -------------------------------------------------- */
/* -------------------------------------------------- */

export function exportTwoState(rule: Uint8Array): string {
    let stringified = "";
    
    for (let letter = 0; letter < 3; letter++) {
        let binary = 0;
        for (let digit = 0; digit < 6; digit++) {
            binary <<= 1;
            binary |= rule[letter * 6 + digit];
        }
        stringified += base64Dict[binary];
    }

    return stringified;
}

export function exportThreeState(rule: Uint8Array): string {
    let stringified = "";
    
    for (let letter = 0; letter < 45; letter++) {
        let binary = 0;
        for (let idx = 0; idx < 3; idx++) {
            binary <<= 2;
            binary |= rule[letter * 3 + idx];
        }
        stringified += base64Dict[binary];
    }

    return stringified;
}

export function exportRuleDirect(rule: Uint8Array, n: number): string {
    let stringified = "";

    const length = n == 2 ? 3 : 45;
    const perLetter = n == 2 ? 6 : 3;
    const width = n == 2 ? 1 : 2;

    for (let letter = 0; letter < length; letter ++) {
        let binary = 0;
        for (let idx = 0; idx < perLetter; idx++) {
            binary <<= width;
            binary |= rule[letter * perLetter + idx];
        }
        stringified += base64Dict[binary];
    }

    return stringified;
}

export function importTwoState(stringified: string): Uint8Array {
    const rule = new Uint8Array(18);

    for (let i = 0; i < 3; i++) {
        const chomp = base64Dict.indexOf(stringified[i]);
        for (let bit = 0; bit < 6; bit++) {
            rule[i * 6 + bit] = (chomp >> (5 - bit)) & 1;
        }
    }

    return rule;
}

export function importRuleDirect(stringified: string, n: number): Uint8Array {
    const rule = new Uint8Array(n == 2 ? 18: 135);

    const length = n == 2 ? 3 : 45;
    const perLetter = n == 2 ? 6 : 3;
    const width = n == 2 ? 1 : 2;

    for (let i = 0; i < length; i++) {
        const chomp = base64Dict.indexOf(stringified[i]);
        for (let idx = 0; idx < perLetter; idx++) {
            rule[i * perLetter + idx] = (chomp >> (6 - width - idx * width)) & (n == 2 ? 0b1 : 0b11);
        }
    }

    return rule;
}

export function packRule(rule: Uint8Array, n: number): Uint8Array {
    /* encodes each rule in 4 bits for 2 rules per byte */
    /* also omits extraneous rules beyond needed length */

    /* length of resultant array (may end up incorporating an extraneous nibble) */
    const ruleLength = n * chooseWithRep(n, 8);
    let length;
    if (n <= 4) {
        /* each index is 2 bits, so we can pack 4 per byte */
        length = Math.ceil(ruleLength / 4.0); 
    } else if (n <= 8) {
        /* each index is 3 bits, so we pack 8 across 3 bytes */
        length = Math.ceil(ruleLength / 8.0) * 3;
    } else if (n <= 16){
        /* each index is 4 bits, so we pack 2 per byte */
        length = Math.ceil(ruleLength / 2.0);
    } else {
        return rule;
    }

    const packed = new Uint8Array(length);

    if (4 < n && n < 9) {
        /* the 8 x 3 packing scheme is unique */
        for (let block = 0; block < length / 3; block++) {
            const bytes = [0, 0, 0];
            for (let bit = 0; bit < 24; bit++) {
                const ruleIdx = Math.floor(bit / 3);
                const ruleOffset = (2 - bit % 3);
                const ruleBit = (rule[block * 8 + ruleIdx] >> ruleOffset) & 1;

                const byte = Math.floor(bit / 8);
                const byteOffset = (7 - bit % 8);
                bytes[byte] |= (ruleBit << byteOffset);
            }
            for (let i = 0; i < 3; i++) {
                packed[block * 3 + i] = bytes[i];
            }
        }
    } else {
        /* so much easier */
        const width = (n < 5 ? 2 : 4);
        const perByte = (n < 5 ? 4 : 2);
        for (let i = 0; i < length; i++) {
            let byte = 0;
            for (let j = 0; j < perByte; j++) {
                byte <<= width;
                byte |= rule[i * perByte + j];
            }
            packed[i] = byte;
        }
    }

    return packed;
}

export function oldPackRule(rule: Uint8Array, n: number) {
    const length = (n * chooseWithRep(n, 8) + 1) / 2;
    const packed = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
        let byte = rule[i * 2] & 15; //first nibble
        byte <<= 4; //make space for the second
        byte |= rule[i * 2 + 1] & 15; //second nibble
        packed[i] = byte;  
    }

    return packed;
}

export function oldUnpackRule(packed: Uint8Array): Uint8Array {
    /* simply reverses the packing */
    const rule = new Uint8Array(packed.length * 2);

    for (let i = 0; i < packed.length; i++) {
        const byte = packed[i];
        rule[i * 2] = (byte >> 4) & 15;
        rule[i * 2 + 1] = byte & 15;
    }

    return rule;
}

export function unpackRule(packed: Uint8Array, n: number): Uint8Array {
    /* simply reverses the packing */
    let length; 
    if (n <= 4) {
        length = packed.length * 4;
    } else if (n <= 8) {
        length = packed.length * 8 / 3;
    } else if (n <= 16) {
        length = packed.length * 2;
    } else {
        return packed;
    }
    
    const rule = new Uint8Array(length);

    if (4 < n && n < 9) {
        /* the messy case */
        for (let block = 0; block < length / 3; block++) {
            const ruleSeg = new Uint8Array(8).fill(0);
            for (let bit = 0; bit < 24; bit++) {
                const byteIdx = Math.floor(bit / 8);
                const byteOffset = (7 - bit % 8);
                const byteBit = (packed[block * 3 + byteIdx] >> byteOffset) & 1;

                const ruleIdx = Math.floor(bit / 3);
                const ruleOffset = (2 - bit % 3);
                ruleSeg[ruleIdx] |= (byteBit << ruleOffset);
            }
            for (let i = 0; i < 8; i++) {
                rule[block * 8 + i] = ruleSeg[i];
            }
        }
    } else {
        /* the nice case */
        const width = (n < 5 ? 2 : 4);
        const perByte = (n < 5 ? 4 : 2);
        for (let i = 0; i < packed.length; i++) {
            for (let j = 0; j < perByte; j++) {
                const idx = i * perByte + j;
                const offset = 8 - (j + 1) * width;
                rule[idx] = (packed[i] >> offset) & (n < 5 ? 0b11 : 0b1111); 
            }
        }
    }

    return rule;
}

export function stringifyRule(rule: Uint8Array): string {
    /* compresses and stringifies a rule */
    let binary = "";

    const compressed = deflate(rule, { level: 9});

    for (let i = 0; i < compressed.length; i++) {
        binary += String.fromCharCode(compressed[i]);
    }
        
    console.log("bytelength:", binary.length)
    const stringified = btoa(binary);
    console.log("Length:", stringified.length);
    return stringified;
}

export function rulifyString(rule: string): Uint8Array {
    /* decompresses a stringified rule */
    const binary = atob(rule);
    const compressed = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        compressed[i] = binary.charCodeAt(i);
    }
    
    return inflate(compressed);
}

/* ----------------- LINEAR ALGEBRA ----------------- */
/* -------------------------------------------------- */
/* -------------------------------------------------- */

export function fmod(a: number, b: number) {
    return a - b * Math.floor(a / b);
}