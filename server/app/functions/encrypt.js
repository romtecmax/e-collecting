import crypto from "crypto";

/*
 * Encrypts a string using AES-256-GCM with a key from the ENCRYPTION_SECRET env var.
 * Returns an object with ciphertext and iv as hex strings.
 */
export async function encryptString(plaintext) {
  
  // Get the secret key from the environment variable
  const secretHex = process.env.ENCRYPTION_SECRET;
  if (!secretHex) throw new Error("ENCRYPTION_SECRET env var not set");

  // Convert secret to bytes (must be 32 bytes for AES-256-GCM)
  const keyBytes = Buffer.from(secretHex, "hex");
  if (keyBytes.length !== 32) throw new Error("ENCRYPTION_SECRET must be 32 bytes");

  // Generate a random 12-byte IV
  const iv = crypto.randomBytes(12);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv);

  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Return as hex strings
  return {
    ciphertext_with_tag: encrypted.toString("hex") + tag.toString("hex"),
    iv: iv.toString("hex"),
  };
}