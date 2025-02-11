import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const AUTONOMYS_RPC = "wss://rpc.autonomys.network";
let api;

async function initAPI() {
    if (!api) {
        const wsProvider = new WsProvider(AUTONOMYS_RPC);
        api = await ApiPromise.create({ provider: wsProvider });
    }
    return api;
}

export async function sendMessage(recipient, encryptedMessage, encryptedKey, expiresAt, senderSeed) {
    const api = await initAPI();
    const keyring = new Keyring({ type: "sr25519" });
    const sender = keyring.addFromUri(senderSeed);

    const tx = api.tx.autoWhisper.sendMessage(recipient, encryptedMessage, encryptedKey, expiresAt);
    const unsub = await tx.signAndSend(sender, ({ status }) => {
        console.log(`Transaction status: ${status.type}`);
        if (status.isFinalized) {
            console.log(`Transaction finalized at blockHash ${status.asFinalized}`);
            unsub();
        }
    });
}

export async function getMessages(account) {
    const api = await initAPI();
    return await api.query.autoWhisper.getMessages(account);
}
