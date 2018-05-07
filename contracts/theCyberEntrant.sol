pragma solidity ^0.4.19;

contract theCyberGatekeeperInterface {
  function enter(bytes32 _passcode, bytes8 _gateKey) public returns (bool);
}

contract theCyberEntrant {
  // This contract can get past the gatekeeper!

  function enter(bytes32 _passcode, bytes8 _gateKey) public returns (bool) {
    require(theCyberGatekeeperInterface(0x03c58b60013897b3EcB20b2DA1D886CA082F2602).enter(_passcode, _gateKey));
    return true;
  }

}