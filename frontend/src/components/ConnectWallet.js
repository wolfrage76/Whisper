import React from "react";
import { Contract, providers, Wallet } from "ethers";
import { ethers } from "ethers";

function ConnectWallet({ setWalletConnected, setAccount }) {
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const signer = provider.getSigner();
                const account = await signer.getAddress();
                setAccount(account);
                setWalletConnected(true);
            } catch (error) {
                console.error("Wallet connection failed:", error);
            }
        } else {
            alert("MetaMask or a Web3 wallet is required!");
        }
    };

    return <button onClick={connectWallet}>Connect Wallet</button>;
}

export default ConnectWallet;
