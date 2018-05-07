pragma solidity ^0.4.19;


contract theCyberForceFunder {
  // this is an example contract that will send funds into theCyber even though
  // it does not implement any payable keywords. We can then test the donation
  // functionality.

  address private constant THECYBERADDRESS = 0xD93E32A72208B24625f6601e90E287C38A55E4da;

  function () public payable {}

  function forceFund() public {
    selfdestruct(THECYBERADDRESS);
  }
}