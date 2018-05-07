# theCyberDapp

A basic dapp frontend for interacting with theCyber, a decentralized club on the Ethereum blockchain. The club maintains a registry of up to 256 members and provides methods for verifying memberships by address and for managing memberships.

The contracts can be found at [thecyber.eth](https://etherscan.io/address/thecyber.eth#code) and [util.thecyber.eth](https://etherscan.io/address/util.thecyber.eth#code). To join as a member, register with the gatekeeper contract at [gatekeepertwo.thecyber.eth](https://etherscan.io/address/gatekeepertwo.thecyber.eth#code) (be aware that the contract will only accept the first 128 entrants).

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
