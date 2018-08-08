const SponsoredEvent = artifacts.require('SponsoredEvent');
const mock = require('./mock');

contract('SponsoredEvent', (accounts) => {
  let testEvent;

  beforeEach(() => {
    return SponsoredEvent.new(
        mock.eventName,
        mock.signUpFee,
        mock.recipientAddress,
        mock.recipientName
      )
      .then(instance => {
        testEvent = instance;
        return testEvent;
      })
  });

  contract('create', () => {
    it('should create a new event', () => {
      return testEvent.eventName();
      assert.equal(eventName, mock.eventName);
    });
    it('should create a new recipient', () => {
      return testEvent.recipient();
      assert.equal(recipient[1], mock.recipientAddress);
    });
  });

  contract('sign up', (accounts) => {
    it('should accept a valid signup', () => {
      return testEvent.signUpForEvent(mock.participantName, {
          from: accounts[0],
          value: mock.signUpFee,
          gas: 150000,
          gasPrice: 1
        })
        .then(tx => {
          assert.equal(tx.receipt.status, 0x1, 'Sign-up was not successful');
        });
    });
    it('should reject a signup without fee', () => {
      return testEvent.signUpForEvent(mock.participantName, {
          from: accounts[0],
          value: 0,
          gas: 150000,
          gasPrice: 1
        })
        .catch(err => {
          err.message.match(/revert/);
        });
    });
  });

  contract('pledge', (accounts) => {
    it('should allow a valid pledge', () => {
      return testEvent.pledge(0, mock.sponsorName)
        .then(tx => {
          assert.equal(tx.receipt.status, 0x1, 'Pledge was not successful');
        });
    });
  });
});