pragma solidity ^0.4.19;


contract theCyberForceFunder {
  // this is an example contract that will send funds into theCyber even though
  // it does not implement any payable keywords. We can then test the donation
  // functionality.

  address private constant THECYBERADDRESS = 0x97A99C819544AD0617F48379840941eFbe1bfAE1;

  function () public payable {}

  function forceFund() public {
    selfdestruct(THECYBERADDRESS);
  }
}