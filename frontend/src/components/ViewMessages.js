import React, { useEffect, useState } from "react";
import { getMessages } from "../utils/contract_autonomys";
import { connectWallet } from "../utils/connect_wallet_autonomys";

const ViewMessages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        async function fetchMessages() {
            const wallet = await connectWallet();
            const msgs = await getMessages(wallet);
            setMessages(msgs);
        }
        fetchMessages();
    }, []);

    return (
        <div>
            <h2>Received Messages</h2>
            {messages.length === 0 ? (
                <p>No messages found</p>
            ) : (
                messages.map((msg, index) => (
                    <div key={index}>
                        <p><strong>From:</strong> {msg.sender}</p>
                        <p><strong>Message:</strong> {msg.decryptedMessage}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default ViewMessages;
