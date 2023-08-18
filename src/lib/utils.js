import crypto from "crypto";

/**
 * Get hash (md5) from current input.
 *
 * @param {string} input - input to be encrypted
 * @returns {string} hash of md5 algorithm applied to given input
 */
export function hash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
} 