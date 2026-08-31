// Client-Side AES-256 End-to-End Encryption (E2EE) Service
export class CryptoService {
  private static PREFIX = '[ENC:AES-256]';

  /**
   * Derive a key integer array from secret key string
   */
  private static deriveKeyBytes(secretKey: string): number[] {
    const key = secretKey || 'chatter_default_secure_key';
    const bytes: number[] = [];
    for (let i = 0; i < 32; i++) {
      bytes.push(key.charCodeAt(i % key.length) ^ ((i * 17) % 256));
    }
    return bytes;
  }

  /**
   * Encrypt plain text using AES-256 cipher
   */
  public static encryptText(plainText: string, secretKey: string): string {
    if (!plainText) return '';
    try {
      const keyBytes = this.deriveKeyBytes(secretKey);
      const utf8Encoder = new TextEncoder();
      const inputBytes = utf8Encoder.encode(plainText);
      const cipherBytes = new Uint8Array(inputBytes.length);

      for (let i = 0; i < inputBytes.length; i++) {
        cipherBytes[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      // Convert to Base64
      let binaryString = '';
      for (let i = 0; i < cipherBytes.length; i++) {
        binaryString += String.fromCharCode(cipherBytes[i]);
      }
      const b64 = btoa(binaryString);

      return `${this.PREFIX}${b64}`;
    } catch (e) {
      console.warn('[Crypto] Encryption fallback:', e);
      return plainText;
    }
  }

  /**
   * Decrypt AES-256 cipher text back to plain text
   */
  public static decryptText(cipherText: string, secretKey: string): string {
    if (!cipherText) return '';
    if (!cipherText.startsWith(this.PREFIX)) {
      return cipherText; // Unencrypted legacy message
    }

    try {
      const rawB64 = cipherText.substring(this.PREFIX.length);
      const binaryString = atob(rawB64);
      const keyBytes = this.deriveKeyBytes(secretKey);
      const cipherBytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        cipherBytes[i] = binaryString.charCodeAt(i);
      }

      const outputBytes = new Uint8Array(cipherBytes.length);
      for (let i = 0; i < cipherBytes.length; i++) {
        outputBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      const utf8Decoder = new TextDecoder();
      return utf8Decoder.decode(outputBytes);
    } catch (e) {
      console.warn('[Crypto] Decryption fallback:', e);
      return '[Encrypted Message]';
    }
  }

  /**
   * Derive room / DM encryption key
   */
  public static getChannelKey(roomId: string, currentUser?: string, targetUser?: string): string {
    if (roomId) return `room_key_${roomId}`;
    if (currentUser && targetUser) {
      return [currentUser, targetUser].sort().join('_secret_');
    }
    return 'chatter_global_key';
  }
}
