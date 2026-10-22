const AES_ALGO = 'AES-GCM';

// Derives a cryptographic key from a password string using PBKDF2
async function getKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('chatvobs-salt-string-2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: AES_ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Decrypts a Base64-encoded AES-GCM ciphertext.
 * If decryption fails or the payload is not encrypted, returns the original text as-is.
 */
export async function decryptText(encryptedBase64: string, secret: string): Promise<string> {
  if (!encryptedBase64) return '';
  try {
    const binary = atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }
    
    if (combined.length <= 12) {
      return encryptedBase64;
    }
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const key = await getKey(secret);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: AES_ALGO, iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    // Return original string if it is plain-text (fails decryption)
    return encryptedBase64;
  }
}
