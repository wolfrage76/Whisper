import * as ecies from "eciesjs";
import { utils } from "ethers";

/**
 * Encrypts a message using AES-GCM and encrypts the key using ECIES.
 * @param {string} message - The plaintext message to encrypt.
 * @param {string} recipientPublicKey - The recipient's Ethereum public key.
 * @param {number} expirationHours - Number of hours before the message expires.
 * @returns {Object} - Object containing encryptedMessage, encryptedKey, and expiration timestamp.
 */
export async function encryptMessage(message, recipientPublicKey, expirationHours) {
    const randomKey = utils.hexlify(utils.randomBytes(32)); // Generate AES key
    const iv = utils.hexlify(utils.randomBytes(12)); // Generate IV for AES-GCM
    
    // Encrypt message using AES-GCM
    const encryptedMessage = await aesEncrypt(randomKey, iv, message);
    
    // Encrypt AES key using ECIES
    const encryptedKey = ecies.encrypt(Buffer.from(recipientPublicKey, "hex"), Buffer.from(randomKey.slice(2), "hex"));
    
    return {
        encryptedMessage,
        encryptedKey: encryptedKey.toString("hex"),
        expiresAt: Math.floor(Date.now() / 1000) + expirationHours * 3600,
    };
}

/**
 * Decrypts an encrypted message using ECIES and AES-GCM.
 * @param {Object} encryptedData - Encrypted message and key.
 * @param {string} privateKey - Recipient's Ethereum private key.
 * @returns {string} - Decrypted plaintext message.
 */
export async function decryptMessage(encryptedData, privateKey) {
    const decryptedKey = ecies.decrypt(Buffer.from(privateKey, "hex"), Buffer.from(encryptedData.encryptedKey, "hex")).toString("hex");
    
    if (Date.now() / 1000 > encryptedData.expiresAt) {
        return "Message expired.";
    }
    return await aesDecrypt(decryptedKey, encryptedData.encryptedMessage);
}

// AES-GCM Encryption function
async function aesEncrypt(key, iv, message) {
    const keyBuffer = Buffer.from(key.slice(2), "hex");
    const ivBuffer = Buffer.from(iv.slice(2), "hex");
    const encoder = new TextEncoder();
    
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBuffer, { name: "AES-GCM" }, false, ["encrypt"]
    );
    
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivBuffer }, cryptoKey, encoder.encode(message)
    );
    return utils.hexlify(new Uint8Array(encrypted));
}

// AES-GCM Decryption function
async function aesDecrypt(key, encryptedMessage) {
    const keyBuffer = Buffer.from(key, "hex");
    const encryptedBuffer = Buffer.from(encryptedMessage.slice(2), "hex");
    const ivBuffer = encryptedBuffer.slice(0, 12);
    const dataBuffer = encryptedBuffer.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer }, cryptoKey, dataBuffer
    );
    return new TextDecoder().decode(decrypted);
}