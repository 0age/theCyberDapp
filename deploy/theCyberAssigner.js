var Web3 = require('web3');

const address = '0x612fb91090c8919a7f55c5728e1b061e287ba92f';

web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8845'));

const abi = [
    {
      "constant": false,
      "inputs": [],
      "name": "assignAll",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "nextAssigneeIndex",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "maxEntrants",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "pure",
      "type": "function"
    }
  ]

// CHANGE CONTRACT AND SWAP IN NEW theCyber ADDRESS BEFORE SETTING NEW BYTECODE
const bytecode = "0x60606040526000805460ff19166001179055341561001c57600080fd5b6105168061002b6000396000f30060606040526004361061003d5763ffffffff60e060020a6000350416634d5eceac8114610042578063606436521461006b57806390ae631d1461007e575b600080fd5b341561004d57600080fd5b6100556100a5565b60405160ff909116815260200160405180910390f35b341561007657600080fd5b6100556100b3565b341561008957600080fd5b6100916100b8565b604051901515815260200160405180910390f35b600054610100900460ff1690565b608090565b600080548190819081908190819060ff1615156100d457600080fd5b625b8d805a116100e357600080fd5b7303c58b60013897b3ecb20b2da1d886ca082f260263694463a26000604051602001526040518163ffffffff1660e060020a028152600401602060405180830381600087803b151561013457600080fd5b6102c65a03f1151561014557600080fd5b5050506040518051955050608060ff8616101561016157600080fd5b73d93e32a72208b24625f6601e90e287c38a55e4da63a7f2f4e23060006040516040015260405160e060020a63ffffffff841602815273ffffffffffffffffffffffffffffffffffffffff90911660048201526024016040805180830381600087803b15156101cf57600080fd5b6102c65a03f115156101e057600080fd5b505050604051805190602001805150909450508315156101ff57600080fd5b600054610100900460ff1691505b608060ff8316108015610222575062030d405a115b156104ae577303c58b60013897b3ecb20b2da1d886ca082f260263e7b4e5ab8360006040516020015260405160e060020a63ffffffff841602815260ff9091166004820152602401602060405180830381600087803b151561028357600080fd5b6102c65a03f1151561029457600080fd5b5050506040518051915073d93e32a72208b24625f6601e90e287c38a55e4da905063a7f2f4e28260006040516040015260405160e060020a63ffffffff841602815273ffffffffffffffffffffffffffffffffffffffff90911660048201526024016040805180830381600087803b151561030e57600080fd5b6102c65a03f1151561031f57600080fd5b50505060405180519060200180515090945073d93e32a72208b24625f6601e90e287c38a55e4da905063aef3bc1760018401600060405160a0015260405160e060020a63ffffffff841602815260ff909116600482015260240160a060405180830381600087803b151561039257600080fd5b6102c65a03f115156103a357600080fd5b505050604051805190602001805190602001805190602001805190602001805197505050505073ffffffffffffffffffffffffffffffffffffffff821615801591506103ed575083155b801561040d575073ffffffffffffffffffffffffffffffffffffffff8316155b156104a35773d93e32a72208b24625f6601e90e287c38a55e4da638c9c29776001840160008460405160e060020a63ffffffff861602815260ff9093166004840152602483019190915273ffffffffffffffffffffffffffffffffffffffff166044820152606401600060405180830381600087803b151561048e57600080fd5b6102c65a03f1151561049f57600080fd5b5050505b60019091019061020d565b6000805461ff00191661010060ff858116820292909217928390556080920416106104de576000805460ff191690555b600195505050505050905600a165627a7a72305820b9fa868b9a722447a7d94c0f8a03f8256aa20c5e8eb2f548ea1856453eef4d840029"

const theCyberAssigner = new web3.eth.Contract(abi);

theCyberAssigner.deploy({
    data: bytecode
})
.send({
    from: address,
    gas: 7777777,
    gasPrice: '1000616765'
}, function(error, transactionHash){})
.on('error', function(error){ console.log(error) })
.on('transactionHash', function(transactionHash){ console.log(transactionHash) })
.on('receipt', function(receipt){
   console.log(receipt.contractAddress) // contains the new contract address
   console.log(receipt.events)
})
.on('confirmation', function(confirmationNumber, receipt){ console.log(confirmationNumber) })
.then(function(newContractInstance){
    console.log(newContractInstance.options.address) // instance with the new contract address
}).then(() => {
  process.exit()
})
