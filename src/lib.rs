#![cfg_attr(not(feature = "std"), no_std)]

//use ink::prelude::*;
use ink::storage::Mapping;
//use ink::env::DefaultEnvironment;

#[ink::contract]
mod auto_whisper {
    use super::*;

    #[ink(storage)]
    pub struct AutoWhisper {
        messages: Mapping<AccountId, Vec<(AccountId, Vec<u8>, Vec<u8>, u64)>>,
    }

    #[ink(event)]
    pub struct MessageSent {
        #[ink(topic)]
        sender: AccountId,
        #[ink(topic)]
        recipient: AccountId,
        encrypted_message: Vec<u8>,
        encrypted_key: Vec<u8>,
        expires_at: u64,
    }

    impl Default for AutoWhisper {
    fn default() -> Self {
        Self::new()
        }
    }

    impl AutoWhisper {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                messages: Mapping::default(),
            }
        }

        #[ink(message)]
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
        pub fn get_messages(&self) -> Vec<(AccountId, Vec<u8>, Vec<u8>, u64)> {
            let caller = self.env().caller();
            self.messages.get(caller).unwrap_or_default()
        }
    }
}
