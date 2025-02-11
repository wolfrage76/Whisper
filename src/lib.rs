#![cfg_attr(not(feature = "std"), no_std)]

//use ink::prelude::*;
use ink::storage::Mapping;
//use ink::env::DefaultEnvironment;

#[ink::contract]
/// A contract for sending encrypted messages between accounts.
mod auto_whisper {
    use super::*;

    #[ink(storage)]
    /// Stores the messages for each account.
    pub struct AutoWhisper {
        /// A mapping of account IDs to their corresponding messages.
        messages: Mapping<AccountId, Vec<(AccountId, Vec<u8>, Vec<u8>, u64)>>,
    }

    #[ink(event)]
    /// Emitted when a message is sent.
    pub struct MessageSent {
        #[ink(topic)]
        /// The account ID of the sender.
        sender: AccountId,
        #[ink(topic)]
        /// The account ID of the recipient.
        recipient: AccountId,
        /// The encrypted message.
        encrypted_message: Vec<u8>,
        /// The encrypted key.
        encrypted_key: Vec<u8>,
        /// The block number at which the message expires.
        expires_at: u64,
    }

    impl Default for AutoWhisper {
        /// Creates a new instance of the contract with an empty mapping.
        fn default() -> Self {
            Self::new()
        }
    }

    impl AutoWhisper {
        #[ink(constructor)]
        /// Creates a new instance of the contract with an empty mapping.
        pub fn new() -> Self {
            Self {
                messages: Mapping::default(),
            }
        }

        #[ink(message)]
        /// Sends an encrypted message from the caller to the recipient.
        ///
        /// # Parameters
        /// - `recipient`: The account ID of the recipient.
        /// - `encrypted_message`: The encrypted message.
        /// - `encrypted_key`: The encrypted key.
        /// - `expires_at`: The block number at which the message expires.
        pub fn send_message(
            &mut self,
            recipient: AccountId,
            encrypted_message: Vec<u8>,
            encrypted_key: Vec<u8>,
            expires_at: u64,
        ) {
            let sender = self.env().caller();
            let mut existing_messages = self.messages.get(recipient).unwrap_or_default();
            existing_messages.push((sender, encrypted_message.clone(), encrypted_key.clone(), expires_at));
            self.messages.insert(recipient, &existing_messages);

            self.env().emit_event(MessageSent {
                sender,
                recipient,
                encrypted_message,
                encrypted_key,
                expires_at,
            });
        }

        #[ink(message)]
        /// Returns the messages for the caller.
        pub fn get_messages(&self) -> Vec<(AccountId, Vec<u8>, Vec<u8>, u64)> {
            let caller = self.env().caller();
            self.messages.get(caller).unwrap_or_default()
        }
    }
}

