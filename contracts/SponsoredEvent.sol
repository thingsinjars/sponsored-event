pragma solidity ^0.4.21;

import './Depositable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/** @title SponsoredEvent */
contract SponsoredEvent is Ownable, Depositable {

  string public eventName;
  uint256 public signUpFee;
  address public organiser;
  Recipient public recipient;
  uint public registeredCount = 0;

  // The number of pledges
  uint public pledgeCount = 0;

  // Whether the event has finished
  bool public ended = false;

  // Whether this contract is finished
  bool public closed = false;

  bool public cancelled = false;

  struct Recipient {
    string recipientName;
    address recipientAddress;
  }

  struct Pledge {
    address sponsorAddress;
    uint256 pledgeAmount;
    uint participantId;
    string sponsorName;
    bool paid;
  }

  struct Participant {
    string participantName;
    address participantAddress;
    bool completed;
    bool finalized;
  }

  // Events
  event CreateRecipient(address recipientAddress, string recipientName);
  event CreateEvent(string eventName, uint256 signUpFee);
  event SignUpEvent(address addr, uint256 value, uint participantId, string participantName);
  event NewPledge(uint pledgeId, address sponsorAddress, uint256 pledgeAmount, uint256 balance);
  event ParticipantCompletedEvent(uint participantId);
  event RecipientTransfer(address addr, uint256 pledgeAmount);
  event WithdrawEvent(address addr, bool return, uint256 pledgeAmount);

  // Maintain list of all sponsors so they can be refunded if the event is cancelled
  mapping(address => Pledge) public pledges;
  mapping(uint => address) public pledgeIndex;

  // Participant[] public participants;
  mapping (address => Participant) public participants;
  mapping (uint => address) public participantsIndex;

  /* Modifiers */
  modifier onlyActive {
    require(!ended && !closed);
    _;
  }

  modifier onlyEnded {
    require(ended);
    _;
  }

  modifier onlyClosed {
    require(closed);
    _;
  }

  modifier onlyUnclosed {
    require(!closed);
    _;
  }

  /**
   * @dev Creates a SponsoredEvent contract
   *
   * Each SponsoredEvent has:
   *
   *  - An organiser
   *  - A recipient
   *
   * @param _eventName Public name of the Sponsored Event
   * @param _signUpFee Fee paid by the participants to join
   * @param _recipientAddress where the money goes at the end
   * @param _recipientName Public name of the Recipient of the funds
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
   * @dev Join an event by providing a name and transferring
   * the minimum sign-up fee
   *
   * @param _participantName Public name of the event participant
   * @returns uint
   */
  function signUpForEvent(string _participantName) public payable returns (uint) {

    // Are they sending enough to cover the sign-up fee?
    require(msg.value >= signUpFee);

    // Continue only if the sender is not already registered
    require(!isRegistered(msg.sender));

    // Transfer the sign-up fee from the participant to the event
    deposit();

    // Create participant lookups
    participantsIndex[registeredCount] = msg.sender;
    participants[msg.sender] = Participant(_participantName, msg.sender, false, false);

    emit SignUpEvent(msg.sender, msg.value, registeredCount, _participantName);

    // Increase the number of participants registered for this event
    registeredCount++;

    // return the number of people registered
    return registeredCount;
  }

  /**
   * @dev Transfer money from the sponsor to the contract
   *
   * @params _participantId Index of the participant in the participantIndex
   * @params _sponsorName Public name of the sponsor
   */
  function pledge(uint _participantId, string _sponsorName) public payable {

    // Add a pledge to this SponsoredEvent's pledge list
    pledgeIndex[pledgeCount] = msg.sender;
    pledges[msg.sender] = Pledge(msg.sender, msg.value, _participantId, _sponsorName, false);

    emit NewPledge(pledgeCount, msg.sender, msg.value, getContractBalance());

    // Increase the number of pledges
    pledgeCount++;
  }

  /**
   * @dev Mark the participant as having completed the event
   *
   * NOTE: This version doesn't allow partial completion
   *
   * @param _participantIds[] Array of participants who have completed the event
   * @modifier onlyOwner Only the organiser of this event may call this
   * @modifier onlyActive Only events that have not ended
   */
  function participantCompleted(uint[] _participantIds) external onlyOwner onlyActive {
    for (uint i=0; i < _participantIds.length; i++) {
      address _addr = participantsIndex[_participantIds[i]];
      require(isRegistered(_addr));
      require(!hasCompleted(_addr));
      participants[_addr].completed = true;
      emit ParticipantCompletedEvent(i);
    }
  }

  /**
   * @dev End the event
   *  - Transfer valid funds and sign-up fees to recipient
   *  - Mark this event as ended
   *
   * @modifier onlyOwner Only the organiser of this event may call this
   * @modifier onlyActive Only events that have not ended
   */
  function endEvent() external onlyOwner onlyActive {
    transferToRecipient();
    ended = true;
  }

  /**
   * @dev Transfer the money to the recipient
   *
   *  - Transfer the balance of pledges given to 
   *    participants who completed the event
   *    to the intended recipient and end the event.
   *  - Mark the event as ended
   *
   * @modifier onlyOwner Only the organiser of this event may call this
   * @modifier onlyActive Only events that have not ended
   */
  function transferToRecipient() internal onlyOwner onlyActive {
    uint256 transferAmount = 0;
    for (uint i = 0; i < pledgeIndex.length; i++) {
      Pledge pledge = pledgeIndex[i];

      // This pledge hasn't been paid yet
      if(!pledge.paid) {
        // If this participant has completed the event
        address participantAddress = participantsIndex[pledge.participantId];
        if(hasCompleted(participantAddress)) {
          transferAmount += pledge.pledgeAmount;
          pledge.paid = true;

          participants[_addr].completed = true;

          // Also include the signup fee from each participant
          transferAmount += signUpFee;
        }
      }
    }

    recipient.recipientAddress.transfer(pledgeAmount);

    emit RecipientTransfer(recipient.recipientAddress, pledgeAmount);
  }

  /**
   * @dev Reclaim pledge
   *
   * After the event has ended, if the participant did not
   * complete the event, the sponsor can reclaim the pledge
   * or send it to the recipient anyway
   *
   * @param _returnPledge Should this be returned to the sponsor?
   * @modifier onlyEnded This event must have passed
   * @modifier onlyUnclosed This contract is still open
   */
  function sponsorReclaim(bool _returnPledge) external onlyEnded onlyUnclosed {
    Pledge pledge = pledges[msg.sender];

    // This can only be called by the original sponsor
    require(pledge.sponsorAddress == msg.sender);

    // Only if the pledge hasn't already been paid
    require(!pledge.paid);

    Participant participant = participants[pledge.participantAddress];

    // If the participant didn't complete
    require(!participant.completed);

    // Mark this pledge as paid
    pledge.paid = true;

    if(_returnPledge) {
      // Return it to the sponsor
      pledge.sponsorAddress.transfer(pledge.pledgeAmount);
    } else {
      // Forward to the recipient
      recipient.recipientAddress.transfer(pledge.pledgeAmount);
    }
    emit WithdrawEvent(msg.sender, _returnPledge, pledge.pledgeAmount);
  }

  /**
   * @dev Transfers any outstanding funds and closes the contract
   *
   * Any funds remaining in the contract by the time this is called
   * will be transferred to the recipient regardless of the
   * participant's completion status
   * 
   * @modifier onlyEnded This event must have passed
   * @modifier onlyUnclosed This contract is still open
   */
  function closeEvent() public onlyOwner onlyEnded onlyUnclosed {
    uint256 finalPayout = getContractBalance();
    recipient.recipientAddress.transfer(finalPayout);
    emit Closure(finalPayout);
    closed = true;
  }

  /**
   * Cancel the event
   *
   * Transfer all the pledged money back to the sponsors
   * Transfer the sign-up fee back to the participant
   */
  // function cancelEvent() public onlyOwner onlyActive {
  // }

  /* Helper */
  function isRegistered(address _addr) constant public returns (bool) {
    return participants[_addr].participantAddress != address(0);
  }

  function hasCompleted(address _addr) constant public returns (bool) {
    return isRegistered(_addr) && participants[_addr].completed;
  }

}
