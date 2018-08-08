const SponsoredEvent = artifacts.require('SponsoredEvent');
const mock = require('./mock');

contract('SponsoredEvent: create', (accounts) => {
    it('should create a new event', () => {
        return SponsoredEvent.new(
            mock.eventName,
            mock.signUpFee,
            mock.recipientAddress,
            mock.recipientName
          )
        .then(async (instance) => {
            const eventName = await instance.eventName();
            assert.equal(eventName, mock.eventName);
        })
    });
    it('should create a new recipient', () => {
        return SponsoredEvent.new(
            mock.eventName,
            mock.signUpFee,
            mock.recipientAddress,
            mock.recipientName
          )
        .then(async (instance) => {
            const recipient = await instance.recipient();
            assert.equal(recipient[1], mock.recipientAddress);
        });
    });
});

contract('SponsoredEvent: Sign up', (accounts) => {
    it('should accept a valid signup', () => {
        return SponsoredEvent.new(
            mock.eventName,
            mock.signUpFee,
            mock.recipientAddress,
            mock.recipientName
          )
        .then(instance => instance.signUpForEvent(mock.participantName, {
            from: accounts[0],
            value: mock.signUpFee,
            gas: 150000,
            gasPrice: 1
          }))
        .then(tx => {
            assert.equal(tx.receipt.status, 0x1, 'Sign-up was not successful');
        });
    });
    it('should reject a signup without fee', () => {
        return SponsoredEvent.new(
            mock.eventName,
            mock.signUpFee,
            mock.recipientAddress,
            mock.recipientName
          )
        .then(instance => instance.signUpForEvent(mock.participantName, {
            from: accounts[0],
            value: 0,
            gas: 150000,
            gasPrice: 1
          }))
        .catch(err => {
            err.message.match(/revert/);
        });
    });
});