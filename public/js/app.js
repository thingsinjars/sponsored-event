App = {};
App = {
  web3Provider: null,
  contracts: {},
  sponsoredEvent: null,
  userAccount: null,
  onLoad: () => {

  },

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('/contracts/SponsoredEvent.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SponsoredEventArtifact = data;
      App.contracts.SponsoredEvent = TruffleContract(SponsoredEventArtifact);

      // Set the provider for our contract
      App.contracts.SponsoredEvent.setProvider(App.web3Provider);
    });

    // Load Gas Price
    // App.gasPrice = web3.toWei(3, 'gwei');
    // $.get('https://ethgasstation.info/json/ethgasAPI.json', function(res) {
    //   App.gasPrice = web3.toWei(res.safeLow / 10, 'gwei'); // for some reason the gas price is 10 times more expensive the one displayed on the web page.
    // })
    web3.eth.getGasPrice((err, value) => {
      App.gasPrice = value.toString();
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#loadButton', App.handleLoad);
    $(document).on('click', '#createButton', App.handleCreate);
    $(document).on('click', '#signUpButton', App.handleSignUp);
    $(document).on('click', '#loadParticipantButton', App.handleLoadParticipant);
    $(document).on('click', '#pledgeButton', App.handlePledge);
    return App.loadAccount()
      .then(accounts => {
        App.userAccount
        $('.myAccount').html(accounts[0]);
      });
  },

  watchEvent: function() {
    if (App.sponsoredEvent) {
      var event = App.sponsoredEvent
        .allEvents({
          fromBlock: 0,
          toBlock: 'latest'
        })
        .watch(function(error, result) {
          if (error) {
            console.error('Error: ' + error);
          } else {
            console.log('Event: ', result);
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
      const signUpFee = await App.sponsoredEvent.signUpFee();
      const eventName = await App.sponsoredEvent.eventName();
      const recipient = await App.sponsoredEvent.recipient();
      const organiserId = await App.sponsoredEvent.owner();
      const eventBalance = await App.sponsoredEvent.getContractBalance();
      const registeredCount = await App.sponsoredEvent.registeredCount();
      const pledgeCount = await App.sponsoredEvent.pledgeCount();
      const recipientName = recipient[0];
      const recipientAddress = recipient[1];

      $('#showEventId').html(eventAddress);
      $('#showSignUpFee').html(web3.fromWei(signUpFee, 'ether').toNumber() + ' Ether');
      $('.showEventName').html(eventName);
      $('#showRecipientAddress').html(recipientAddress);
      $('.showRecipientName').html(recipientName);
      $('#showOrganiserId').html(organiserId);
      $('.showEventBalance').html(web3.fromWei(eventBalance, "ether").toNumber() + ' Ether');
      $('#showParticipantCount').html(registeredCount.toNumber());
      $('#showPledgeCount').html(pledgeCount.toNumber());
      $('#status').html('');
    } else {
      $('#status').html('No event found with that ID');
    }
  },

  showAllParticipants: async function() {
    if (App.sponsoredEvent) {
      const count = (await App.sponsoredEvent.registeredCount()).toNumber();
      const list = $('#participantList');
      for(let i = 0; i < count; i++) {
        const participantAddress = await App.sponsoredEvent.participantsIndex(i);
        const participantDetails = await App.sponsoredEvent.participants(participantAddress);

        list.append(`<li><a href="participant/${i}">${participantDetails[0]}</a></li>`);
      }
    }
  },

  showParticipantDetails: async function(participantId) {
    if (App.sponsoredEvent) {
      const participantAddress = await App.sponsoredEvent.participantsIndex(participantId);
      const participantDetails = await App.sponsoredEvent.participants(participantAddress);

      $('.showParticipantName').html(participantDetails[0]);
      $('.showParticipantAddress').html(participantAddress);
    }
  },

  loadEvent: (eventAddress) => {
    return App.contracts.SponsoredEvent.at(eventAddress)
      .then((instance) => {
        App.sponsoredEvent = instance;
        return App.sponsoredEvent;
      })
      .catch(err => {
        console.log(err.message);
      });
  },

  handleLoad: function(event) {
    event.preventDefault();
    return App.loadEvent($('#eventId').val())
      .then(sponsoredEvent => {
        App.watchEvent();
        App.showEventDetails();
      })

  },

  handleCreate: function(event) {
    event.preventDefault();

    return App.loadAccount()
      .then(accounts => {
        $('#status').html('Creating');
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
            //     $('#status').html('');
            //     App.watchEvent();
            //     App.showEventDetails();
            //   })
            return eventAddress;
          })
          .catch(function(err) {
            if (err.message && err.message.match(/the tx doesn't have the correct nonce/).length > 0) {
              $('#status').html('Reset account in MetaMask.');
            }
            console.log(err.message);
          });

      })
      .catch(err => {
        console.error(err);
        $('#status').html('No account found. Connect MetaMask or Mist.');
      })
  },

  handleSignUp: async(event) => {
    event.preventDefault();
    const signUpFee = await App.sponsoredEvent.signUpFee();
    return App.loadEvent($('#signUpEventId').val())
      .then(sponsoredEvent => {
        const participantName = $('#participantName').val();
        App.loadAccount()
          .then(accounts => accounts[0])
          .then(account => {
            console.log(
              participantName, {
                from: account,
                value: signUpFee,
                gas: 6721975,
                gasPrice: App.gasPrice
              })
            return sponsoredEvent.signUpForEvent(
              participantName, {
                from: account,
                value: signUpFee,
                gas: 6721975,
                gasPrice: App.gasPrice
              }
            )

          })
          // 
          .then(signUpTx => {
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

  handleLoadParticipant: async(event) => {
    event.preventDefault();
    return App.loadEvent($('#signUpEventId').val())
      .then(async() => {
        const participantAddress = await App.sponsoredEvent.participantsIndex(0);
        console.log(participantAddress);
        const participantDetails = await App.sponsoredEvent.participants(participantAddress);
        console.log(participantDetails);
        return participantAddress;
      })
  },

  handlePledge: async(event) => {
    event.preventDefault();
    $('#status').html('Pledging');
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
                gas: 6721975,
                gasPrice: App.gasPrice
              }
            )
          })
          .then(signUpTx => {
            $('#status').html('');
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
  }

};

$(window).on("load", function() {
  App.init()
    .then(App.onLoad);
})