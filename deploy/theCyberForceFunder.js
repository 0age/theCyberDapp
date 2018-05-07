var Web3 = require('web3');

const address = '0x612fb91090c8919a7f55c5728e1b061e287ba92f';

web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8845'));

const abi = [
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "forceFund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CHANGE CONTRACT AND SWAP IN NEW theCyber ADDRESS BEFORE SETTING NEW BYTECODE
const bytecode = "0x60606040523415600e57600080fd5b60ac8061001c6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063ad77f884146041575b005b3415604b57600080fd5b60516053565b005b73746f31d110d0b5402c41cd7d988d9d75a6aac7c573ffffffffffffffffffffffffffffffffffffffff16ff00a165627a7a72305820a5ffe7ebae1cfdb54b89269c92d8a62677005afe8d9b50919d6b0901f0f630200029";

const theCyberForceFunder = new web3.eth.Contract(abi);

theCyberForceFunder.deploy({
    data: bytecode
})
.send({
    from: address,
    gas: 3000000,
    gasPrice: '3000616765'
}, function(error, transactionHash){})
.on('error', function(error){ console.log(error) })
.on('transactionHash', function(transactionHash){ console.log(transactionHash) })
.on('receipt', function(receipt){
   console.log(receipt.contractAddress) // contains the new contract address
})
.on('confirmation', function(confirmationNumber, receipt){ console.log(confirmationNumber) })
.then(function(newContractInstance){
    console.log(newContractInstance.options.address) // instance with the new contract address
}).then(() => {
  process.exit()
})
