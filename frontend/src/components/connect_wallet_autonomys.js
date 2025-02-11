import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";

export async function connectWallet() {
    await web3Enable("AutoWhisper");
    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
        alert("No Substrate accounts found!");
        return null;
    }

    return accounts[0].address;
}
