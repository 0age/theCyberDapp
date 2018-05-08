# theCyberDapp

A basic dapp frontend for interacting with theCyber, a decentralized club on the Ethereum blockchain. The club maintains a registry of up to 256 members and provides methods for verifying memberships by address and for managing memberships.

The contracts can be found at [thecyber.eth](https://etherscan.io/address/thecyber.eth#code) and [util.thecyber.eth](https://etherscan.io/address/util.thecyber.eth#code). To join as a member, register with the gatekeeper contract at [gatekeepertwo.thecyber.eth](https://etherscan.io/address/gatekeepertwo.thecyber.eth#code) (be aware that the contract will only accept the first 128 entrants).

The dapp is available at [https://thecyber.network](https://thecyber.network). It is advised to run against a custom node using a websocket RPC to properly support contract event subscriptions.

If you are not a member (yet :grin:) but are interested in playing around with theCyber, check out the [testRPC branch](https://github.com/0age/theCyberDapp/tree/testRPC) to get a local copy running.

To run the dapp locally, first install the required dependencies:
```
$ yarn install
```

To run a development version of the frontend (https is required for ledger support and will show a security warning due to the self-signed cert):

```
$ HTTPS=true yarn start
```

To build the production frontend (compiles to `build` folder), set the `homepage` field in `package.json` followed by:

```
$ yarn run build
```

Collaboration is welcome - just fork this repo and submit a pull request (or request to be added as a maintainer). A few features that still need to be implemented include:

* secure local storage that persists message history - currently, encrypted direct messages cannot be read by the sender once sent
* use of openpgp.js keyrings for managing multiple private keys - that way, old encrypted messages can still be read after a member changes their public key
* responsive design improvements to the dapp - mobile web3 browsers such as Cipher Browser will work, but are not pretty
* off-chain messaging via webRTC - this may be better suited to another dedicated dapp that reads information from theCyber but does not submit any transactions. The best method for decentralized signaling / peer discovery is also still an open question.
* more tests :joy:
* any other ideas for improvements - theCyber belongs to each member equally!