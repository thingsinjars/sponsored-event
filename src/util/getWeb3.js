import Web3 from "web3";
const NETWORKS = {
  "1": "Main Net",
  "2": "Deprecated Morden test network",
  "3": "Ropsten test network",
  "4": "Rinkeby test network",
  "42": "Kovan test network",
  "4447": "Truffle Develop Network",
  "5777": "Ganache Blockchain"
};

/*
 * 1. Check for injected web3 (mist/metamask)
 * 2. If metamask/mist create a new web3 instance and pass on result
 * 3. Get networkId - Now we can check the user is connected to the right network to use our dApp
 * 4. Get user account from metamask
 * 5. Get user balance
 */

const enableWeb3 = async function() {
  let provider;
  if (
    typeof window.ethereum !== "undefined" ||
    typeof window.web3 !== "undefined"
  ) {
    // Web3 browser user detected. You can now use the provider.
    provider = window["ethereum"] || window.web3.currentProvider;
    window.ethereum.autoRefreshOnNetworkChange = false;
  }
  const web3 = new Web3(provider);
  await window.ethereum.enable(); 
  return {
    injectedWeb3: provider.isConnected(),
    provider,
    web3() {
      return web3;
    }
  };
};

const getNetwork = result => {
  const networkId = result.web3().eth.currentProvider.networkVersion;
  const network = NETWORKS[networkId];
  return Object.assign({}, result, { network, networkId });
};

const getAddress = result => {
  return new Promise(function(resolve, reject) {
    // Retrieve coinbase
    result.web3().eth.getAccounts((err, accounts) => {
      if (err) {
        reject(new Error("Unable to retrieve account"));
      } else {
        result = Object.assign({}, result, { coinbase: accounts[0],  account: accounts[0] });
        resolve(result);
      }
    });
  });
};

const getBalance = result => {
  return new Promise(function(resolve, reject) {
    // Retrieve balance for coinbase
    result.web3().eth.getBalance(result.account, (err, balance) => {
      if (err) {
        reject(
          new Error(
            "Unable to retrieve balance for address: " + result.account
          )
        );
      } else {
        result = Object.assign({}, result, { balance });
        resolve(result);
      }
    });
  });
};

let getWeb3 = enableWeb3()
  .then(getNetwork)
  .then(getAddress)
  .then(getBalance);

export default getWeb3;
