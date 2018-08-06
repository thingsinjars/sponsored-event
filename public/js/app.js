App = {};
App = {
  web3Provider: null,
  contracts: {},
  sponsoredEvent: null,
  userAccount: null,
  env: 'local',
  onLoad: () => {},

  // Load the contract, set up the UI
  init: function() {
    return App.initWeb3()
      .then(App.initContract)
      .then(App.bindEvents)
      .then(App.initUI)
      .catch(e => {
        App.status(e, true);
        console.error(e)
      });
  },

  status: function(message, error) {
    clearTimeout(App.statusTimer);
    if(!message || typeof message === 'undefined') {
      $('#status').html('');
      $('#status').removeClass('error');
    } else {
      $('#status').html(message);
      if(error) {
        $('#status').addClass('error');
      } else {
        $('#status').removeClass('error');
        App.statusTimer = setTimeout(App.status, 5000);
      }
    }
  },

  initWeb3: async function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = await new Web3(App.web3Provider);

    if (!web3.isConnected()) {
      throw new Error('Not connected to network');
    }

  },

  initContract: function() {
    return $.getJSON('/contracts/SponsoredEvent.json')
      .then((data) => {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var SponsoredEventArtifact = data;
        App.contracts.SponsoredEvent = TruffleContract(SponsoredEventArtifact);

        // Set the provider for our contract
        return App.contracts.SponsoredEvent.setProvider(App.web3Provider);
      })
      .then(() => {
        // Load Gas Price
        if (App.env !== 'local') {
          return $.get('https://ethgasstation.info/json/ethgasAPI.json')
            .then(res => {
              // The values from ethgasstation are in Gwei tenths
              // so to convert it to wei: 
              // LowPrice = json.safeLow/10 * 1000000000
              return web3.toWei(res.safeLow / 10, 'gwei');
            })
        } else {
          return new Promise((resolve, reject) => {
            setTimeout(function() {
              reject('Not connected to web3.')
            }, 10000);
            web3.eth.getGasPrice((err, value) => {
              if (err) {
                reject(err);
              } else {
                App.status('Connected to web3');
                resolve(value.toString());
              }
            })
          });
        }
      })
      .then(gasPrice => {
        return App.gasPrice = gasPrice
      });

  },

  bindEvents: function() {
    $(document).on('click', '#loadButton', App.handleLoad);
    $(document).on('click', '#createButton', App.handleCreate);
    $(document).on('click', '#signUpButton', App.handleSignUp);
    $(document).on('click', '#loadParticipantButton', App.handleLoadParticipant);
    $(document).on('click', '#pledgeButton', App.handlePledge);
    $(document).on('click', '#endButton', App.handleEndEvent);
    return true;
  },

  initUI: function() {
    return App.loadAccount()
      .then(accounts => $('.myAccount').html(accounts[0]))
  },

  setStage(stage) {
    $(`.stage`).removeClass('active');
    $(`.stage-${stage}`).addClass('active');
  },

  watchEvent: function() {
    if (App.sponsoredEvent) {
      var event = App.sponsoredEvent
        .allEvents({
          fromBlock: localStorage.getItem('earliestBlock') || 0,
          toBlock: 'latest'
        })
        .watch((error, result) => {
          if (error) {
            console.error(error);
          } else {
            localStorage.setItem('earliestBlock', result.blockNumber);
            console.log(result);
          }
        });
    }
  },

  loadAccount: function() {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((error, accounts) => {
        if (error) {
          reject(error);
        }
        resolve(accounts)
      })
    });
  },

  showEventDetails: async function() {
    if (App.sponsoredEvent) {
      const eventAddress = App.sponsoredEvent.address;
      const eventEnded = await App.sponsoredEvent.ended();
      const eventClosed = await App.sponsoredEvent.closed();
      const signUpFee = await App.sponsoredEvent.signUpFee();
      const eventName = await App.sponsoredEvent.eventName();
      const recipient = await App.sponsoredEvent.recipient();
      const organiserId = await App.sponsoredEvent.owner();
      const eventBalance = await App.sponsoredEvent.getContractBalance();
      const registeredCount = await App.sponsoredEvent.registeredCount();
      const pledgeCount = await App.sponsoredEvent.pledgeCount();
      const recipientName = recipient[0];
      const recipientAddress = recipient[1];

      $('.showEventId').html(eventAddress);

      const stage = eventClosed ? 'closed' : eventEnded ? 'ended' : 'open';
      $('.showEventStatus').html(stage);
      App.setStage(stage);

      $('.showSignUpFee').html(web3.fromWei(signUpFee, 'ether').toNumber() + ' Ether');
      $('.showEventName').html(eventName);
      $('.showRecipientAddress').html(recipientAddress);
      $('.showRecipientName').html(recipientName);
      $('.showOrganiserId').html(organiserId);
      $('.showEventBalance').html(web3.fromWei(eventBalance, "ether").toNumber() + ' Ether');
      $('.showParticipantCount').html(registeredCount.toNumber());
      $('.showPledgeCount').html(pledgeCount.toNumber());
      App.status();
    } else {
      App.status('No event found with that ID', true);
    }
  },

  showAllParticipants: async function() {
    if (App.sponsoredEvent) {
      const count = (await App.sponsoredEvent.registeredCount()).toNumber();
      const list = $('#participantList');
      const formList = $('#participantFormList');
      for (let i = 0; i < count; i++) {
        const participantAddress = await App.sponsoredEvent.participantsIndex(i);
        const participantDetails = await App.sponsoredEvent.participants(participantAddress);

        list.append(`<li><a href="participant/${i}">${participantDetails[0]}</a></li>`);
        if (participantDetails[2]) {
          // participant has already completed
          formList.append(`<div class="checkbox"> <label> <input type="checkbox" disabled="disabled" name="participants"> ${participantDetails[0]} (completed)</label> </div>`);
        } else {
          formList.append(`<div class="checkbox"> <label> <input type="checkbox" class="check" name="participants" value="${i}"> ${participantDetails[0]}</label> </div>`);
        }
      }
      $("#checkAll").click(function() {
        $(".check").prop('checked', $(this).prop('checked'));
      });
    }
  },

  showParticipantDetails: async(participantId) => {
    if (App.sponsoredEvent) {
      const participantAddress = await App.sponsoredEvent.participantsIndex(participantId);
      const participantDetails = await App.sponsoredEvent.participants(participantAddress);

      $('.showParticipantName').html(participantDetails[0]);
      $('.showParticipantAddress').html(participantAddress);
    }
  },

  loadEvent: async(eventAddress) => {
    App.status('loading...');
    try {
      App.sponsoredEvent = await App.contracts.SponsoredEvent.at(eventAddress);
      App.status();
      App.watchEvent();
      return App.sponsoredEvent;
    } catch (err) {
      console.error(err.message || err);
    }
  },

  // Button handlers
  handleLoad: async(event) => {
    event.preventDefault();
    await App.loadEvent($('#eventId').val());
    App.showEventDetails();
  },

  handleCreate: function(event) {
    event.preventDefault();

    return App.loadAccount()
      .then(accounts => {
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
          })
          .then(eventAddress => {
            $('#createButton').html('Create').removeAttr('disabled');
            window.location = `/event/${eventAddress}`;
            // App.loadEvent(eventAddress)
            //   .then(sponsoredEvent => {
            //     App.status('');
            //     App.watchEvent();
            //     App.showEventDetails();
            //   })
            return eventAddress;
          })
          .catch(function(err) {
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
              debugger;
            }
          });

      })
      .catch(err => {
        App.status('No account found. Connect MetaMask or Mist.');
        console.error(err);
      })
  },

  handleSignUp: async(event) => {
    event.preventDefault();

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
      )
      .then(tx => {
        // TODO: make not fragile
        const log = tx.logs.filter(log => log.event === 'SignUpEvent')[0];
        window.location = `/event/${log.address}/participant/${log.args.participantId.toNumber()}`;
      });

    } catch (err) {
      App.status(err.message);
    }
  },

  handleLoadParticipant: async(event) => {
    event.preventDefault();
    await App.loadEvent($('#signUpEventId').val())

    const participantAddress = await App.sponsoredEvent.participantsIndex(0);
    console.log(participantAddress);

    const participantDetails = await App.sponsoredEvent.participants(participantAddress);
    console.log(participantDetails);

    return participantAddress;
  },

  handlePledge: async(event) => {
    event.preventDefault();
    App.status('Pledging');
    $('#pledgeButton').html('Pledging').attr('disabled', 'disabled');
    return App.loadEvent($('#pledgeEventId').val())
      .then(sponsoredEvent => {
        const participantId = $('#pledgeParticipantId').val();
        const sponsorName = $('#sponsorName').val();
        const pledgeAmount = web3.toWei(+$('#pledgeAmount').val(), 'ether');
        return App.loadAccount()
          .then(accounts => accounts[0])
          .then(account => {
            return sponsoredEvent.pledge(
              participantId, sponsorName, {
                from: account,
                value: pledgeAmount,
                gas: 150000,
                gasPrice: App.gasPrice
              }
            )
          })
          .then(signUpTx => {
            App.status('');
            $('#pledgeButton').html('Pledge').removeAttr('disabled');
            window.location = `/event/${App.sponsoredEvent.address}`;
            return signUpTx;
          })
          .catch(err => {
            console.log(err.message);
          });
      })
      .catch(err => {
        console.log(err.message);
      })
  },

  handleParticipantComplete: async(event) => {
    event.preventDefault();
    const organiserId = await App.sponsoredEvent.owner();
    const myAccount = await App.loadAccount().then(accounts => accounts[0]);
    if (organiserId !== myAccount) {
      App.status('Not the organiser of this event', true);
      return;
    }

    App.status('Marking');
    $('#completeButton').html('Marking').attr('disabled', 'disabled');

    var participantIds = $("#participantFormList input:checkbox:checked").map(function() {
      return $(this).val();
    }).get();

    const sponsoredEvent = await App.loadEvent($('#eventId').val());

    const tx = await sponsoredEvent.participantCompleted(participantIds, {
      gas: 6721975,
      gasPrice: App.gasPrice
    });

    App.status('');
    $('#completeButton').html('Mark complete').removeAttr('disabled');

    //   // App.status('');
    //   // $('#pledgeButton').html('Pledge').removeAttr('disabled');
    //   // window.location = `/event/${App.sponsoredEvent.address}`;
    //   return signUpTx;
    // })
    // .catch(err => {
    //   console.log(err.message);
    // })
  },

  handleEndEvent: async(event) => {
    event.preventDefault();
    const organiserId = await App.sponsoredEvent.owner();
    const myAccount = await App.loadAccount().then(accounts => accounts[0]);
    if (organiserId !== myAccount) {
      App.status('Not the organiser of this event', error);
      return;
    }

    App.status('Ending');
    $('#completeButton').html('Ending').attr('disabled', 'disabled');

    var participantIds = $("#participantFormList input:checkbox:checked").map(function() {
      return $(this).val();
    }).get();

    const sponsoredEvent = await App.loadEvent($('#eventId').val());

    const tx = await sponsoredEvent.endEvent({
      gas: 60000,
      gasPrice: App.gasPrice
    });

    window.location = `/event/${App.sponsoredEvent.address}`;

    App.status();
    $('#completeButton').html('Event ended');
  }

};

$(window).on("load", function() {
  App.init()
    .then(App.onLoad)
    .catch(e => {
      alert(e)
    })
})