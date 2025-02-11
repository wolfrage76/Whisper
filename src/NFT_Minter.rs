#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::*;
use ink::storage::Mapping;

#[ink::contract]
mod whisper_nft {
    use super::*;

    #[ink(storage)]
    /// A simple NFT contract that allows minting, transferring, and burning NFTs.
    ///
    /// Each NFT is represented by a unique `u32` identifier, and is mapped to
    /// its owner's `AccountId`.
    pub struct WhisperNFT {
        /// Mapping from NFT ID to the owner's account ID.
        owners: Mapping<u32, AccountId>, // NFT ID → Owner
    }

    #[ink(event)]
    /// Event emitted when an NFT is transferred from one owner to another.
    pub struct NFTTransferred {
        /// The ID of the token being transferred.
        #[ink(topic)]
        token_id: u32,
        /// The account ID of the old owner.
        #[ink(topic)]
        old_owner: AccountId,
        /// The account ID of the new owner.
        #[ink(topic)]
        new_owner: AccountId,
    }

    #[ink(event)]
    /// Event emitted when an NFT is burned.
    pub struct NFTBurned {
        /// The ID of the token being burned.
        #[ink(topic)]
        token_id: u32,
        /// The account ID of the owner of the burned token.
        #[ink(topic)]
        owner: AccountId,
    }

    impl WhisperNFT {
        #[ink(constructor)]
        /// Creates a new instance of the WhisperNFT contract.
        pub fn new() -> Self {
            Self {
                owners: Mapping::default(),
            }
        }

        #[ink(message)]
        /// Mints a new NFT with the given `token_id` and assigns it to the `recipient`.
        ///
        /// # Parameters
        /// - `token_id`: The unique identifier for the new NFT.
        /// - `recipient`: The account ID of the recipient who will own the new NFT.
        pub fn mint(&mut self, token_id: u32, recipient: AccountId) {
            self.owners.insert(token_id, &recipient);
        }

        #[ink(message)]
        /// Transfers an NFT with the given `token_id` to a `new_owner`.
        ///
        /// Emits an `NFTTransferred` event.
        ///
        /// # Parameters
        /// - `token_id`: The unique identifier of the NFT to transfer.
        /// - `new_owner`: The account ID of the new owner.
        pub fn transfer(&mut self, token_id: u32, new_owner: AccountId) {
            let old_owner = self.owners.get(&token_id).unwrap();
            self.owners.insert(token_id, &new_owner);

            self.env().emit_event(NFTTransferred {
                token_id,
                old_owner,
                new_owner,
            });
        }

        #[ink(message)]
        /// Burns an NFT with the given `token_id`, removing it from the contract.
        ///
        /// Emits an `NFTBurned` event.
        ///
        /// # Parameters
        /// - `token_id`: The unique identifier of the NFT to burn.
        pub fn burn(&mut self, token_id: u32) {
            let owner = self.owners.get(&token_id).unwrap();
            self.owners.remove(&token_id);

            self.env().emit_event(NFTBurned {
                token_id,
                owner,
            });
        }

        #[ink(message)]
        /// Returns the owner of the NFT with the given `token_id`, if it exists.
        ///
        /// # Parameters
        /// - `token_id`: The unique identifier of the NFT.
        ///
        /// # Returns
        /// - `Option<AccountId>`: The account ID of the owner, or `None` if the NFT does not exist.
        pub fn owner_of(&self, token_id: u32) -> Option<AccountId> {
            self.owners.get(&token_id)
        }
    }
}

