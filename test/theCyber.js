const theCyber = artifacts.require('theCyber');

var openpgp = require('openpgp');
var fs = require('fs');
require.extensions['.pem'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
const testPublicKeyFile = require('./keys/example_public_key.pem');
const testPrivateKeyFile = require('./keys/example_private_key.pem');

const MAXMEMBERS = 256;
const INACTIVITYTIMEOUT = 5;
const DONATIONADDRESS = '0x7468654379626572446F6e6174696f6e41646472';

contract('theCyber test', async (accounts) => {

  it("should set up the caller as the first member (#0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let isMember = membershipStatus[0];
    let memberId = membershipStatus[1].toNumber();
    
    assert.equal(isMember, true);
    assert.equal(memberId, 0);
  });

  it("should not let non-members call state-changing methods", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[1];
    let account_two = accounts[2];
    const revertMessage = 'VM Exception while processing transaction: revert';

    try {
      await instance.newMember(1, '', account_one, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.changeName('', {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.changeKey(testPublicKeyFile, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.directMessage(0, '', {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    } 

    try {
      await instance.transferMembership(account_two, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.proclaimInactive(0, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      // TODO: set member as inactive and then jump past the inactivity period
      await instance.revokeMembership(0, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.broadcastMessage('', {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

    try {
      await instance.donateFunds({from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    } 

    try {
      await instance.donateTokens('0x0123456789012345678901234567890123456789', {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }     
  });

  it("should be able to check the maximum number of members", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const expectedMaxMembers = MAXMEMBERS;

    let maxMembersValue = await instance.maxMembers({from: account_one});
    let maxMembers = maxMembersValue.toNumber();

    assert.equal(maxMembers, expectedMaxMembers);
  });

  it("should let a member create a new member & set a name (#0 -> #1)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let account_two = accounts[1]; 
    let newMemberId = 1;
    let newName = 'member1';
    
    let timestamp = false;
    await instance.newMember(newMemberId, newName, account_two, {from: account_one})
      .then(result => {
        timestamp = web3.eth.getBlock(result.receipt.blockNumber).timestamp;
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'NewMember');
        assert.equal(result.logs[0].args.memberId, newMemberId);
        assert.equal(web3.toUtf8(result.logs[0].args.memberName), newName);
        assert.equal(result.logs[0].args.memberAddress, account_two);
      });
    assert.ok(timestamp);

    let membershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isMember = membershipStatus[0];
    let memberId = membershipStatus[1].toNumber();
    
    assert.equal(isMember, true);
    assert.equal(memberId, newMemberId);

    let memberDetails = await instance.getMemberInformation(newMemberId, {from: account_one});
    let memberName = web3.toUtf8(memberDetails[0]);
    let memberKey = memberDetails[1];
    let memberSince = memberDetails[2];
    let memberInactive = memberDetails[3];
    let memberAddress = memberDetails[4];

    assert.equal(memberName, newName);
    assert.equal(memberKey, '');
    assert.equal(memberSince, timestamp);
    assert.equal(memberInactive, 0);
    assert.equal(memberAddress, account_two);
  });

  it("should not let members create new members with a null address", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const null_address = '0x0000000000000000000000000000000000000000';
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.newMember(2, '', null_address, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should not let members create new members with existing member ids", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let account_two = accounts[2];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.newMember(1, '', account_two, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should not let members create new members when another member has the same address", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let account_two = accounts[1];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.newMember(2, '', account_two, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should let a member set their name & get the new name (#0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];

    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    let newName = 'member0';
    await instance.changeName(newName, {from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'NewMemberName');
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(web3.toUtf8(result.logs[0].args.newMemberName), newName);
      });

    let memberDetails = await instance.getMemberInformation(memberId, {from: account_one});
    let memberName = web3.toUtf8(memberDetails[0]);

    assert.equal(memberName, newName);
  });

  it("should let a member set their key & get the new key (#1)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[1];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    await instance.changeKey(testPublicKeyFile, {from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'NewMemberKey');
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(result.logs[0].args.newMemberKey, testPublicKeyFile);
      });

    let memberDetails = await instance.getMemberInformation(memberId, {from: account_one});
    let memberKey = memberDetails[1];

    assert.equal(memberKey, testPublicKeyFile);
  });

  it("should be able to send a direct message (#0 -> #1)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    let account_two = accounts[1];
    let toMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let toMemberId = toMembershipStatus[1].toNumber();

    let toMemberDetails = await instance.getMemberInformation(toMemberId, {from: account_one});
    let toMemberKey = toMemberDetails[1];

    assert.equal(toMemberKey, testPublicKeyFile);

    const message = 'hello member one';

    // encrypt the message using toMemberKey
    var privKeyObj = openpgp.key.readArmored(testPrivateKeyFile).keys[0];

    const encryptOptions = {
      data: message,
      publicKeys: openpgp.key.readArmored(toMemberKey).keys //,
      //privateKeys: privKeyObj  // for signing
    };

    const encryptedMessage = await openpgp.encrypt(encryptOptions)
      .then(ciphertext => {
        return ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
      });

    const encryptedResponse = await instance.directMessage(toMemberId, encryptedMessage, {from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'DirectMessage');   
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(result.logs[0].args.toMemberId, toMemberId);

        return result.logs[0].args.message
      });

    // decrypt the message using toMember's private key
    decryptOptions = {
        message: openpgp.message.readArmored(encryptedResponse),
        //publicKeys: openpgp.key.readArmored(toMemberKey).keys,  // for verifying
        privateKey: privKeyObj
    };

    const decryptedMessage = await openpgp.decrypt(decryptOptions)
      .then(plaintext => {
        return plaintext.data;   
      });

    assert.equal(decryptedMessage, 'hello member one');

  }); 

  it("should let a member transfer a membership (#1 -> #2)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[1];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    let account_two = accounts[2];
    let timestamp = false;
    await instance.transferMembership(account_two, {from: account_one})
      .then(result => {
        timestamp = web3.eth.getBlock(result.receipt.blockNumber).timestamp;
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'MembershipTransferred');
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(result.logs[0].args.newMemberAddress, account_two);
      });
    assert.ok(timestamp);

    let oldMembershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let isOldMember = oldMembershipStatus[0];
    let oldMemberId = oldMembershipStatus[1].toNumber();

    assert.equal(isOldMember, false);
    assert.equal(oldMemberId, 0);

    let newMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isNewMember = newMembershipStatus[0];
    let newMemberId = newMembershipStatus[1].toNumber();
    
    assert.equal(isNewMember, true);
    assert.equal(memberId, newMemberId);

    let memberDetails = await instance.getMemberInformation(newMemberId, {from: account_one});
    let memberName = web3.toUtf8(memberDetails[0]);
    let memberKey = memberDetails[1];
    let memberSince = memberDetails[2];
    let memberInactive = memberDetails[3];
    let memberAddress = memberDetails[4];

    assert.equal(memberName, '');
    assert.equal(memberKey, '');
    assert.equal(memberSince, timestamp);
    assert.equal(memberInactive, 0);
    assert.equal(memberAddress, account_two);
  });

  it("should not let members transfer a membership to a null address", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const null_address = '0x0000000000000000000000000000000000000000';
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.transferMembership(null_address, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should not let members transfer a membership to an existing address", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let account_two = accounts[2];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.transferMembership(account_two, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should let a member designate another member as inactive (#2 -> #0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[2];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    let account_two = accounts[0];
    let inactiveMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let inactiveMemberId = inactiveMembershipStatus[1].toNumber();

    let memberDetails = await instance.getMemberInformation(inactiveMemberId, {from: account_one});
    let memberActive = memberDetails[3].toNumber();

    assert.equal(memberActive, 0);

    let timestamp = false;
    await instance.proclaimInactive(inactiveMemberId, {from: account_one})
      .then(result => {
        timestamp = web3.eth.getBlock(result.receipt.blockNumber).timestamp;
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'MemberProclaimedInactive');
        assert.equal(result.logs[0].args.memberId, inactiveMemberId);
        assert.equal(result.logs[0].args.proclaimingMemberId, memberId);
      });
    assert.ok(timestamp);

    let newMemberDetails = await instance.getMemberInformation(inactiveMemberId, {from: account_one});
    let memberInactive = newMemberDetails[3].toNumber();

    assert.equal(memberInactive, timestamp);
  });

  it("should not let members designate an unassigned membership as inactive", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.proclaimInactive(3, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should not let members designate an already inactive membership as inactive", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[2];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.proclaimInactive(0, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should not let members designate themselves as inactive", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[2];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.proclaimInactive(2, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should let a member tagged as inactive prove they are still active (#0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let inactiveMembershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let inactiveMemberId = inactiveMembershipStatus[1].toNumber();

    let inactiveMemberDetails = await instance.getMemberInformation(inactiveMemberId, {from: account_one});
    let memberInactive = inactiveMemberDetails[3].toNumber();

    assert.ok(memberInactive !== 0);

    await instance.heartbeat({from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'MemberHeartbeated');
        assert.equal(result.logs[0].args.memberId, inactiveMemberId);
      });

    let memberDetails = await instance.getMemberInformation(inactiveMemberId, {from: account_one});
    let memberActive = memberDetails[3].toNumber();

    assert.equal(memberActive, 0);
  });

  it("should be able to check the inactivity timeout length", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const expectedInactivityTimeout = INACTIVITYTIMEOUT

    let inactivityTimeoutValue = await instance.inactivityTimeout({from: account_one});
    let inactivityTimeout = inactivityTimeoutValue.toNumber();

    assert.equal(inactivityTimeout, expectedInactivityTimeout);
  });

  it("should not let members revoke an active member", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const revertMessage = 'VM Exception while processing transaction: revert';

    let account_two = accounts[2]; // member 1 transferred membership earlier
    let revokedMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let revokedMemberId = revokedMembershipStatus[1].toNumber();

    try {
      await instance.revokeMembership(revokedMemberId, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  }); 

  it("should not revoke inactive members until after the inactivity timeout", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const revertMessage = 'VM Exception while processing transaction: revert';

    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let revokingMemberId = membershipStatus[1].toNumber();

    let account_two = accounts[2]; // member 1 transferred membership earlier
    let revokedMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isMember = revokedMembershipStatus[0];
    let revokedMemberId = revokedMembershipStatus[1].toNumber();
    
    assert.equal(isMember, true);
    assert.equal(revokedMemberId, 1);

    let memberDetails = await instance.getMemberInformation(revokedMemberId, {from: account_one});
    let memberActive = memberDetails[3].toNumber();

    assert.equal(memberActive, 0);

    await instance.proclaimInactive(revokedMemberId, {from: account_one});

    let newMemberDetails = await instance.getMemberInformation(revokedMemberId, {from: account_one});
    let memberInactive = newMemberDetails[3].toNumber();

    assert.ok(memberInactive !== 0);

    try {
      await instance.revokeMembership(revokedMemberId, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }

     await instance.heartbeat({from: account_two});

    let newMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isStillMember = newMembershipStatus[0];
    let newMemberId = newMembershipStatus[1].toNumber();
    
    let revertMemberDetails = await instance.getMemberInformation(newMemberId, {from: account_one});
    let stillMemberActive = revertMemberDetails[3].toNumber();

    assert.equal(stillMemberActive, 0);
  });

  it("should revoke members that have been inactive for the inactivity timeout (#0 -> #1)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let revokingMemberId = membershipStatus[1].toNumber();

    let account_two = accounts[2]; // member 1 transferred membership earlier
    let revokedMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isMember = revokedMembershipStatus[0];
    let revokedMemberId = revokedMembershipStatus[1].toNumber();
    
    assert.equal(isMember, true);
    assert.equal(revokedMemberId, 1);

    let memberDetails = await instance.getMemberInformation(revokedMemberId, {from: account_one});
    let memberActive = memberDetails[3].toNumber();

    assert.equal(memberActive, 0);

    await instance.proclaimInactive(revokedMemberId, {from: account_one});

    let newMemberDetails = await instance.getMemberInformation(revokedMemberId, {from: account_one});
    let memberInactive = newMemberDetails[3].toNumber();

    assert.ok(memberInactive !== 0);

    await web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [INACTIVITYTIMEOUT + 5], // adding a small amount sometimes fails
      id: new Date().getTime()
    }, () => {})

    await instance.revokeMembership(revokedMemberId, {from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'MembershipRevoked');
        assert.equal(result.logs[0].args.memberId, revokedMemberId);
        assert.equal(result.logs[0].args.revokingMemberId, revokingMemberId);
      });

    let newMembershipStatus = await instance.getMembershipStatus(account_two, {from: account_one});
    let isStillMember = newMembershipStatus[0];
    let newMemberId = newMembershipStatus[1].toNumber();
    
    assert.equal(isStillMember, false);
    assert.equal(newMemberId, 0);
  });

  it("should not let members revoke an unassigned membership", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.revokeMembership(3, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  }); 

  it("should not let members revoke themselves", async () => {
    // TODO: set the member as inactive and then jump past the inactivity period
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const revertMessage = 'VM Exception while processing transaction: revert';
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let revokingMemberId = membershipStatus[1].toNumber();

    try {
      await instance.revokeMembership(revokingMemberId, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

  it("should be able to broadcast a message (#0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    const message = 'hello world';
    await instance.broadcastMessage(message, {from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'BroadcastMessage');
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(result.logs[0].args.message, 'hello world');
      });
  }); 

  // it should be able to call an external contract (that is compatible)

  it("should be able to check the donation address", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const expectedDonationAddress = DONATIONADDRESS.toLowerCase();

    let donationAddress = await instance.donationAddress({from: account_one});

    assert.equal(donationAddress, expectedDonationAddress);
  });

  it("should be able to donate lost ether to the donation address (#0)", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    let membershipStatus = await instance.getMembershipStatus(account_one, {from: account_one});
    let memberId = membershipStatus[1].toNumber();

    await instance.donateFunds({from: account_one})
      .then(result => {
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'FundsDonated');
        assert.equal(result.logs[0].args.memberId, memberId);
        assert.equal(result.logs[0].args.value, 0);
      });
  });   

  // it should be able to donate a lost token type to the donation address

  it("should not let members designate the contract address when donating tokens", async () => {
    let instance = await theCyber.deployed();
    let account_one = accounts[0];
    const contract_address = instance.address;
    const revertMessage = 'VM Exception while processing transaction: revert';
    try {
      await instance.donateTokens(contract_address, {from: account_one});
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, revertMessage);
    }    
  });

})