var theCyber = artifacts.require("./theCyber.sol");

module.exports = function(deployer) {
  deployer.deploy(theCyber, { gas: 7777777, from: "0x612fb91090c8919a7f55c5728e1b061e287ba92f" });
};