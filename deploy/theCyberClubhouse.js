var Web3 = require('web3');

const address = '0x612fb91090c8919a7f55c5728e1b061e287ba92f';

web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8845'));

const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "passphrase",
        "type": "string"
      }
    ],
    "name": "GrantAdmission",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_passphrase",
        "type": "string"
      }
    ],
    "name": "theCyberMessage",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// CHANGE CONTRACT AND SWAP IN NEW theCyber ADDRESS BEFORE SETTING NEW BYTECODE
const bytecode = "0x6060604052341561000f57600080fd5b6101bc8061001e6000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063a82e0dcc14610046575b600080fd5b341561005157600080fd5b6100a1600480803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506100a3565b005b73d93e32a72208b24625f6601e90e287c38a55e4da73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156100f157600080fd5b7fa7a185385c503e9ada3e526a11ca7fb6c7cdb34ebe2f6fc67f0582e34ab6ea67816040518080602001828103825283818151815260200191508051906020019080838360005b83811015610153578082015181840152602081019050610138565b50505050905090810190601f1680156101805780820380516001836020036101000a031916815260200191505b509250505060405180910390a1505600a165627a7a72305820a79e7d9fb57bb24743975feb7f1668fdf137430f2372e35c37429a28da2da4c20029";

const theCyberClubhouse = new web3.eth.Contract(abi);

theCyberClubhouse.deploy({
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
