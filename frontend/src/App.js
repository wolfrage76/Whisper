import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import SendMessage from "./components/SendMessage";
import ViewMessages from "./components/ViewMessages";

function App() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState(null);

    return (
        <div>
            <h1>AutoWhisper - Web3 Messaging</h1>
            {!walletConnected ? (
                <ConnectWallet setWalletConnected={setWalletConnected} setAccount={setAccount} />
            ) : (
                <>
                    <SendMessage account={account} />
                    <ViewMessages account={account} />
                </>
            )}
        </div>
    );
}

export default App;
