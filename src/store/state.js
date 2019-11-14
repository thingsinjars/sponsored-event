let state = {
  web3: {
    isInjected: false,
    web3Instance: null,
    networkId: null,
    coinbase: null,
    balance: null,
    error: null
  },
  event: {
    eventName: "",
    address: "",
    balance: 0,
    signUpFee: 0,
    recipientName: "",
    recipientAddress: "",
    organiserAddress: "",
    participantCount: 0,
    recipientReceivedTotal: 0,
    pledgeCount: 0,
    stage: ""
  },
  contractInstance: null,
  participants: [],
}
export default state
