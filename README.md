# theCyberDapp

A basic dapp frontend for interacting with theCyber, a decentralized club on the Ethereum blockchain. The club maintains a registry of up to 256 members and provides methods for verifying memberships by address and for managing memberships.

The contracts can be found at [thecyber.eth](https://etherscan.io/address/thecyber.eth#code) and [util.thecyber.eth](https://etherscan.io/address/util.thecyber.eth#code). To join as a member, register with the gatekeeper contract at [gatekeepertwo.thecyber.eth](https://etherscan.io/address/gatekeepertwo.thecyber.eth#code) (be aware that the contract will only accept the first 128 entrants).

The dapp is available at [https://thecyber.network](https://thecyber.network). It is advised to run against a custom node using a websocket RPC to properly support contract event subscriptions.

To run the dapp locally, first install the required dependencies:
```
$ yarn install
```

To start a local RPC backend running on port `8845` with a network id of `8045` and a group of known deterministic (a.k.a. unsafe) addresses:
```
$ ./node_modules/ganache-cli/build/cli.node.js -p 8845 -i 8045 -m 'spy heavy leaf such exotic fiction seminar sign immune relief increase buddy' --gas-limit 8000000
```

Next, deploy and set up the contracts for theCyber and all ancillary contracts (note that all deploy contracts are hardcoded with compiled contract bytecode & ABI):
```
$ node deploy/all+setup.js
```

To run tests (requires truffle):
```
$ truffle test ./test/theCyber.js
```

To run code linter on contracts:
```
$ ./node_modules/solium/bin/solium.js -d contracts
```

Note: the provided contracts contain references to contract addresses on the mainnet. Be sure to change them to match the developed contract deploy addresses if you want to modify and redeploy them.

To run a development version of the frontend (select custom connection method - also, https will require bypassing the self-signed cert):

```
$ HTTPS=true REACT_APP_WEB3_PROVIDER="ws://localhost:8845" yarn start
```

To build a static frontend (compiles to `build` folder):

```
$ yarn run build
```
