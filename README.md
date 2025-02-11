Encrypted chat system for Autonomys Network http://autonomys.info/

Service to allow sending msgs to a destination wallet, encrypted to the destination wallet's public key, using (currently) only index emitted events containing the encrypted msg.  
Receiver will be able to connect wallet to site to view their messages, which will be automatically decrypted using their connected wallet. 
Eventually notifications will be able to be monitored for when a new message arrives for a wallet.

Using emitted events reduces fees vs storage on the chain.  Autonomys makes it easy to get the public key of a wallet address, unlike EVMs.

Eventually hope to include expiration timestamps in actual encryption that will prevent decryption after a periood of time if possible, vs just filtering them out of the display.
May add NFTs as a 'membership card' with special functionality like allowing additional encryption (NFT could store a key), etc.

Simple yet flexible -- I hope.
