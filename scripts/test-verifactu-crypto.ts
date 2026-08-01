/**
 * Unit checks for verifactu/crypto (run: npx tsx scripts/test-verifactu-crypto.ts)
 */
import assert from "node:assert/strict";
import { randomBytes } from "crypto";

// Ensure a valid 32-byte base64 encryption key is set for testing
process.env.VERIFACTU_ENCRYPTION_KEY = randomBytes(32).toString("base64");

import { encryptSecret, decryptSecret } from "../lib/verifactu/crypto";

// 1. Round-trip encrypt / decrypt
const original = "sk_live_test_secret_key_123456789";
const encrypted = encryptSecret(original);
assert.notEqual(encrypted, original);

const decrypted = decryptSecret(encrypted);
assert.equal(decrypted, original);

// 2. Encryption uses unique IVs per call (randomized output)
const encrypted2 = encryptSecret(original);
assert.notEqual(encrypted, encrypted2);
assert.equal(decryptSecret(encrypted2), original);

// 3. Fail closed on corrupt / invalid ciphertext base64
assert.throws(() => decryptSecret("invalid_short"), /Texto cifrado no válido/);

// 4. Fail closed on tampered ciphertext payload
const tamperedBuf = Buffer.from(encrypted, "base64");
tamperedBuf[tamperedBuf.length - 1] ^= 0xff; // Flip bits in tag / payload
assert.throws(() => decryptSecret(tamperedBuf.toString("base64")));

// 5. Missing or invalid key length throws error
const originalKey = process.env.VERIFACTU_ENCRYPTION_KEY;

delete process.env.VERIFACTU_ENCRYPTION_KEY;
assert.throws(() => encryptSecret("test"), /VERIFACTU_ENCRYPTION_KEY no está definida/);

process.env.VERIFACTU_ENCRYPTION_KEY = Buffer.from("too_short").toString("base64");
assert.throws(() => encryptSecret("test"), /VERIFACTU_ENCRYPTION_KEY debe decodificar a 32 bytes/);

// Restore valid key
process.env.VERIFACTU_ENCRYPTION_KEY = originalKey;

console.log("✓ test-verifactu-crypto: OK");
