import { ethers } from "ethers";
import contractABI from "../contracts/AutoWhisper.json";
import { decryptMessage } from "../utils/encryption"; // Import decryption function

const contractAddress = "0x236D2b9dc5fc8C94b62fcDD52bDF556F78af4a93";

/**
 * Retrieves and decrypts messages sent to the currently connected wallet.
 * @returns {Array} List of messages (decrypted or expired).
 */
export async function getMessagesForAccount() {
    if (!window.ethereum) {
        alert("Please install MetaMask or a Web3 wallet.");
        return [];
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    try {
        console.log("Fetching messages for:", userAddress);

        // Query MessageSent events for the connected wallet
        const messageEvents = await contract.queryFilter(contract.filters.MessageSent(null, userAddress));

        // Process and decrypt messages
        const messages = await Promise.all(
            messageEvents.map(async (event) => {
                const { sender, encryptedMessage, encryptedKey, expiresAt } = event.args;

                // Check if message is expired
                const isExpired = expiresAt.toNumber() < Math.floor(Date.now() / 1000);
                if (isExpired) {
                    return { sender, decryptedMessage: "Expired", expired: true };
                }

                try {
                    // Decrypt message using user's private key
                    const decryptedMessage = await decryptMessage({
                        encryptedMessage,
                        encryptedKey,
                        expiresAt: expiresAt.toNumber(),
                    });

                    return { sender, decryptedMessage, expired: false };
                } catch (error) {
                    console.error("Error decrypting message:", error);
                    return { sender, decryptedMessage: "Decryption failed", expired: false };
                }
            })
        );

        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}
