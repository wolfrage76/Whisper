import React, { useState } from "react";
import { sendMessage } from "../utils/contract_autonomys";
import { connectWallet } from "../utils/connect_wallet_autonomys";

const SendMessage = () => {
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");
    const [expiresAt, setExpiresAt] = useState(Math.floor(Date.now() / 1000) + 7200);
    const [sender, setSender] = useState("");

    const handleConnect = async () => {
        const wallet = await connectWallet();
        setSender(wallet);
    };

    const handleSubmit = async () => {
        if (!recipient || !message) {
            alert("Please enter recipient and message.");
            return;
        }

        await sendMessage(recipient, message, "random_encryption_key", expiresAt, sender);
        alert("Message sent!");
    };

    return (
        <div>
            <button onClick={handleConnect}>Connect Wallet</button>
            <input type="text" placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
            <textarea placeholder="Enter message" onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSubmit}>Send</button>
        </div>
    );
};

export default SendMessage;
