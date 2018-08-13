Object.assign(App, {
  bindEvents: () => {
    $(document).on('click', '#loadButton', App.handleLoad);
    $(document).on('click', '#createButton', App.handleCreate);
    $(document).on('click', '#signUpButton', App.handleSignUp);
    $(document).on('click', '#loadParticipantButton', App.handleLoadParticipant);
    $(document).on('click', '#pledgeButton', App.handlePledge);
    $(document).on('click', '#completeButton', App.handleParticipantComplete);
    $(document).on('click', '#endButton', App.handleEndEvent);
    $(document).on('click', '#closeButton', App.handleCloseEvent);
    return true;
  },

  handleLoad: async (event) => {
    event.preventDefault();
    await App.loadEvent($('#eventId').val());
    App.showEventDetails();
  },

  handleCreate: (event) => {
    event.preventDefault();

    return App.loadAccount()
      .then(() => {
        App.status('Creating');
        $('#createButton').html('Creating').attr('disabled', 'disabled');

        console.info($('#eventName').val(),
          web3.toWei(+$('#signUpFee').val(), 'ether'),
          $('#recipientAddress').val(),
          $('#recipientName').val()
        );
        App.contracts.SponsoredEvent.new(
          $('#eventName').val(),
          web3.toWei(+$('#signUpFee').val(), 'ether'),
          $('#recipientAddress').val(),
          $('#recipientName').val()
        ).then((instance) => {
          return instance.address;
        }).then((eventAddress) => {
          $('#createButton').html('Create').removeAttr('disabled');
          window.location = `/event/${eventAddress}`;
          return eventAddress;
        }).catch((err) => {
          if (err.message) {
            let match = err.message.match(/the tx doesn't have the correct nonce/);
            if (match && match.length > 0 && App.env === 'local') {
              // NOTE: Only do this during development
              App.status('Reset account in MetaMask.', true);
            } else {
              match = err.message.match(/TypeError: Network request failed/);
              if (match && match.length > 0) {
                App.status('Not connected to network.', true);
                throw err;
              }
            }
            console.error(err.message || err);
            App.status(err.message, true);
          }
        });
      }).catch((err) => {
        App.status('No account found. Connect MetaMask or Mist.');
        console.error(err);
      });
  },

  handleSignUp: async (event) => {
    event.preventDefault();
    $('#signUpButton').html('Signing up').attr('disabled', 'disabled');
    
    try {
      await App.loadEvent($('#signUpEventId').val())
      const signUpFee = await App.sponsoredEvent.signUpFee();
      const sponsoredEvent = await App.loadEvent($('#signUpEventId').val());
      const participantName = $('#participantName').val();
      const account = await App.loadAccount().then(accounts => accounts[0]);

      return await sponsoredEvent.signUpForEvent(
        participantName, {
          from: account,
          value: signUpFee,
          gas: 150000,
          gasPrice: App.gasPrice
        }
      ).then((tx) => {
        // TODO: make not fragile
        const log = tx.logs.filter(log => log.event === 'SignUpEvent')[0];
        window.location = `/event/${log.address}/participant/${log.args.participantId.toNumber()}`;
      });

    } catch (err) {
      throw new Error(err);
    }
  },

  handleLoadParticipant: async (event) => {
    event.preventDefault();
    await App.loadEvent($('#signUpEventId').val())

    const participantAddress = await App.sponsoredEvent.participantsIndex(0);
    console.log(participantAddress);

    const participantDetails = await App.sponsoredEvent.participants(participantAddress);
    console.log(participantDetails);

    return participantAddress;
  },

  handlePledge: async (event) => {
    event.preventDefault();
    App.status('Pledging');
    $('#pledgeButton').html('Pledging').attr('disabled', 'disabled');
    return App.loadEvent($('#pledgeEventId').val())
      .then((sponsoredEvent) => {
        const participantId = $('#pledgeParticipantId').val();
        const sponsorName = $('#sponsorName').val();
        const pledgeAmount = web3.toWei(+$('#pledgeAmount').val(), 'ether');
        return App.loadAccount()
          .then(accounts => accounts[0])
          .then((account) => {
            return sponsoredEvent.pledge(
              participantId, sponsorName, {
                from: account,
                value: pledgeAmount,
                gas: 150000,
                gasPrice: App.gasPrice
              }
            )
          })
          .then((signUpTx) => {
            App.status('');
            $('#pledgeButton').html('Pledge').removeAttr('disabled');
            window.location = `/event/${App.sponsoredEvent.address}`;
            return signUpTx;
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((err) => {
        console.log(err.message);
      })
  },

  handleParticipantComplete: async (event) => {
    event.preventDefault();

    try {
      const organiserId = await App.sponsoredEvent.owner();
      const myAccount = await App.loadAccount().then(accounts => accounts[0]);
      if (organiserId !== myAccount) {
        App.status('Not the organiser of this event', true);
        return;
      }

      App.status('Marking');
      $('#completeButton').html('Marking').attr('disabled', 'disabled');

      const participantIds = $('#participantFormList input:checkbox:checked')
        .map((i, el) => $(el).val())
        .get();

      const tx = await App.sponsoredEvent.participantCompleted(participantIds, {
        gas: 32000,
        gasPrice: App.gasPrice
      });

      window.location = window.location;
    } catch(err) {
      App.status(err.message || err, true);
    }
  },

  handleEndEvent: async (event) => {
    event.preventDefault();
    const organiserId = await App.sponsoredEvent.owner();
    const myAccount = await App.loadAccount().then(accounts => accounts[0]);
    if (organiserId !== myAccount) {
      App.status('Not the organiser of this event', true);
      return;
    }

    App.status('Ending');
    $('#endButton').html('Ending').attr('disabled', 'disabled');

    const sponsoredEvent = await App.loadEvent($('#eventId').val());

    const tx = await sponsoredEvent.endEvent({
      gas: 360000,
      gasPrice: App.gasPrice
    });

    window.location = `/event/${App.sponsoredEvent.address}`;

    App.status();
    $('#completeButton').html('Event ended');
  },

  handleCloseEvent: async (event) => {
    event.preventDefault();
    const organiserId = await App.sponsoredEvent.owner();
    const myAccount = await App.loadAccount().then(accounts => accounts[0]);
    if (organiserId !== myAccount) {
      App.status('Not the organiser of this event', true);
      return;
    }

    App.status('Closing');
    $('#closeButton').html('Closing').attr('disabled', 'disabled');

    const sponsoredEvent = await App.loadEvent($('#eventId').val());

    const tx = await sponsoredEvent.closeEvent({
      gas: 360000,
      gasPrice: App.gasPrice,
    });

    window.location = `/event/${App.sponsoredEvent.address}`;
  }

});