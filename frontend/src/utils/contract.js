
import { ethers } from "ethers";
import contractABI from "../contracts/AutoWhisper.json";
import { decryptMessage } from "../utils/encryption";

const contractAddress = "0x236D2b9dc5fc8C94b62fcDD52bDF556F78af4a93"; // Update this with the actual address

const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

/**
 * Sends an encrypted message to the contract.
 */
export async function sendMessageToContract(recipient, encryptedMessage, encryptedKey, expiresAt) {
    if (!window.ethereum) {
        alert("Please install MetaMask or a Web3 wallet.");
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    try {
        console.log("Sending encrypted message...");
        const tx = await contract.sendMessage(recipient, encryptedMessage, encryptedKey, expiresAt);
        await tx.wait();
        console.log("Transaction confirmed!");
    } catch (error) {
        console.error("Error sending message:", error);
    }
}


/**
 * Retrieves messages sent to the currently connected wallet.
 */
export async function getMessagesForAccount() {
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

                const isExpired = expiresAt.toNumber() < Math.floor(Date.now() / 1000);
                if (isExpired) {
                    return { sender, decryptedMessage: "Expired", expired: true };
                }

                try {
                    const decryptedMsg = await decryptMessage({
                        encryptedMessage,
                        encryptedKey,
                        expiresAt: expiresAt.toNumber(),
                    });
                    return { sender, decryptedMessage: decryptedMsg, expired: false };
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

// Export both functions
//export { sendMessageToContract, getMessagesForAccount };
