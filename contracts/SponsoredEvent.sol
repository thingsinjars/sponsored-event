pragma solidity ^0.4.21;

import './Depositable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract SponsoredEvent is Ownable, Depositable {

  string public eventName;
  uint256 public signUpFee;
  address public organiser;
  Recipient public recipient;
  uint public registeredCount = 0;
  uint public pledgeCount = 0;

  struct Recipient {
    string recipientName;
    address recipientAddress;
  }

  struct Pledge {
    address sponsorAddress;
    uint256 pledgeAmount;
    uint participantId;
    string sponsorName;
  }

  struct Participant {
    string participantName;
    address participantAddress;
    uint8 percentComplete;
    bool finalized;
  }

  // Events
  event CreateRecipient(address recipientAddress, string recipientName);
  event CreateEvent(string eventName, uint256 signUpFee);
  event SignUpEvent(address addr, uint256 value, uint participantId, string participantName);
  event NewPledge(uint pledgeId, address sponsorAddress, uint256 pledgeAmount, uint256 balance);

  // Maintain list of all sponsors so they can be refunded if the event is cancelled
  mapping(uint => Pledge) public pledgeIndex;

  // Participant[] public participants;
  mapping (address => Participant) public participants;
  mapping (uint => address) public participantsIndex;

  /**
   * Each SponsoredEvent contract has:
   * 
   *  - An Event Name
   *  - A sign-up fee the participants pay to join
   *  - A Recipient Address where the money goes at the end
   *  - A Recipient Name
   */
  function SponsoredEvent(string _eventName, uint256 _signUpFee, address _recipientAddress, string _recipientName) public {
    // Each event has a single organiser
    organiser = msg.sender;

    eventName = _eventName;
    signUpFee = _signUpFee;

    // Each event has a single recipient
    recipient = Recipient(_recipientName, _recipientAddress);
    emit CreateRecipient(_recipientAddress, _recipientName);
    emit CreateEvent(_eventName, _signUpFee);
  }

  /**
   * Join an event by providing a name and transferring
   * the minimum sign-up fee
   */
  function signUpForEvent(string _participantName) public payable returns (uint) {
    // Are they sending enough to cover the sign-up fee?
    require(msg.value >= signUpFee);

    // Continue only if the sender is not already registered
    require(!isRegistered(msg.sender));

    // Transfer the sign-up fee from the participant to the event
    deposit();

    // Create lookups
    participantsIndex[registeredCount] = msg.sender;
    participants[msg.sender] = Participant(_participantName, msg.sender, 0, false);

    emit SignUpEvent(msg.sender, msg.value, registeredCount, _participantName);

    // Increase the number of participants registered for this event
    registeredCount++;

    // return the number of people registered
    return registeredCount;
  }

  /* Helper */
  function totalBalance() constant public returns (uint256){
    return address(this).balance;
  }

  function isRegistered(address _addr) constant public returns (bool){
    return participants[_addr].participantAddress != address(0);
  }

  // At the end of the event, transfer the signup fee from the participant
  // and the pledge from each participant's sponsors
  // to the recipient
    // recipient.addr.transfer(payoutAmount);



  function pledge(uint _participantId, string _sponsorName) public payable {
    // Add pledge to this SponsoredEvent's pledge list
    pledgeIndex[pledgeCount] = Pledge(msg.sender, msg.value, _participantId, _sponsorName);

    emit NewPledge(pledgeCount, msg.sender, msg.value, totalBalance());

    // Increase the number of pledges
    pledgeCount++;
  }

//   // for this event, get list of sponsorships

//   // for this event, get list of participants
//   // for a participant, get list of sponsorships

//   struct Event {
//     string name;
//     address recipientAddress;
//     address recipientName;
//   }


//   struct Participant {
//     string participantName;
//     address participantAddress;
//     uint8 percentComplete
//     bool finalized;
//   }



//   mapping (address => Participant) public participants;
//   mapping (uint => address) public participantsIndex;


// Sponsor
//   name
//   address
//   pledgeAmount
//   givenAmount
//   refunded

//   mapping (uint => address) public eventToRecipient;

//   function _createEvent(string _name, uint _startTime, uint _endTime, address _recipient) internal

//   string public name;
//   uint public startTime;
//   uint private endTime;



//   address[16] public adopters;

//   // Adopting a pet
//   function adopt(uint petId) public returns (uint) {
//     require(petId >= 0 && petId <= 15);

//     adopters[petId] = msg.sender;

//     return petId;
//   }

//   // Retrieving the adopters
//   function getAdopters() public view returns (address[16]) {
//     return adopters;
//   }
}

