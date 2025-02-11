/// A contract that allows users to send encrypted messages linked to NFTs.
/// The encryption key is stored on the NFT, and the message is stored on this contract.
#[ink::contract]
mod auto_whisper {
    use super::*;
    use ink::env::call::FromAccountId;

    /// The event emitted when a message is sent.
    #[ink(event)]
    pub struct MessageSent {
        /// The NFT ID linked to the encryption key.
        #[ink(topic)]
        nft_id: u32,
        /// The encrypted message.
        encrypted_message: Vec<u8>,
        /// The encrypted encryption key.
        encrypted_key: Vec<u8>,
        /// The block number at which the message expires.
        expires_at_block: u64,
    }

    /// The main contract struct.
    #[ink(storage)]
    pub struct AutoWhisper {
        /// The address of the WhisperNFT contract.
        nft_contract: AccountId,
    }

    impl AutoWhisper {
        /// Creates a new instance of the contract.
        #[ink(constructor)]
        pub fn new(nft_contract: AccountId) -> Self {
            Self { nft_contract }
        }

        /// Sends an encrypted message linked to an NFT.
        #[ink(message)]
        pub fn send_message(
            &self,
            nft_id: u32,
            encrypted_message: Vec<u8>,
            encrypted_key: Vec<u8>,
            blocks_until_expiration: u64,
        ) {
            /// The current block number.
            let current_block = self.env().block_number();
            /// The block number at which the message expires.
            let expires_at_block = current_block + blocks_until_expiration;

            /// Emit the MessageSent event.
            self.env().emit_event(MessageSent {
                nft_id,
                encrypted_message,
                encrypted_key,
                expires_at_block,
            });
        }

        /// Returns the owner of an NFT.
        #[ink(message)]
        pub fn get_nft_owner(&self, nft_id: u32) -> AccountId {
            /// Get an instance of the WhisperNFT contract.
            let nft_instance: ink::contract_ref!(WhisperNFT) = self.nft_contract.into();
            /// Get the owner of the NFT.
            nft_instance.owner_of(nft_id).unwrap()
        }
    }
}

