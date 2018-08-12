App = {};
App = {
  web3Provider: null,
  contracts: {},
  sponsoredEvent: null,
  userAccount: null,
  env: 'local',
  onLoad: () => {},

  // Load the contract, set up the UI
  init: () => {
    return App.initWeb3()
      .then(App.initContract)
      .then(App.bindEvents)
      .then(App.initUI)
      .catch((err) => {
        App.status(err, true);
        $('button').attr('disabled', 'true');
        console.error(err)
      });
  },

  status: (message, error) => {
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

  initWeb3: async () => {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      throw new Error('Please use a web3 enabled browser or install MetaMask');
      // If no injected web3 instance is detected, fall back to Ganache
      // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = await new Web3(App.web3Provider);

    if (!web3.isConnected()) {
      throw new Error('Not connected to network');
    }

  },

  initContract: () => {
    return fetch('/contracts/SponsoredEvent.json')
      .then(res => res.json())
      .then((data) => {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        const SponsoredEventArtifact = data;
        App.contracts.SponsoredEvent = TruffleContract(SponsoredEventArtifact);

        // Set the provider for our contract
        return App.contracts.SponsoredEvent.setProvider(App.web3Provider);
      })
      .then(() => {
        // Load Gas Price
        if (App.env !== 'local') {
          return fetch('https://ethgasstation.info/json/ethgasAPI.json')
            .then(res => res.json())
            .then((data) => {
              // The values from ethgasstation are in Gwei tenths
              // so to convert it to wei: 
              // LowPrice = json.safeLow/10 * 1000000000
              return web3.toWei(data.safeLow / 10, 'gwei');
            });
        }
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Not connected to web3.'));
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
      })
      .then((gasPrice) => {
        App.gasPrice = gasPrice
      });
  },

  watchEvent: () => {
    if (App.sponsoredEvent) {
      const event = App.sponsoredEvent
        .allEvents({
          fromBlock: localStorage.getItem('earliestBlock') || 0,
          toBlock: 'latest'
        })
        .watch((error, result) => {
          if (error) {
            console.error(error);
          } else {
            localStorage.setItem('earliestBlock', result.blockNumber + 1);
            console.log(result);
          }
        });
    }
  },

  loadAccount: () => {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((error, accounts) => {
        if (error) {
          reject(error);
        }
        resolve(accounts)
      })
    });
  },

  loadEvent: async (eventAddress) => {
    App.status('loading...');
    try {
      App.sponsoredEvent = await App.contracts.SponsoredEvent.at(eventAddress);
      App.status();
      App.watchEvent();
      return App.sponsoredEvent;
    } catch (err) {
      debugger;
      App.status(err.message, true);
      console.error(err.message || err);
    }
  }
};

$(window).on("load", () => {
  App.init()
    .then(App.onLoad)
    .catch((err) => {
      alert(err);
    })
});