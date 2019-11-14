import Vue from "vue";
import Vuex from "vuex";
import TruffleContract from "@truffle/contract";

import state from "./state";
import getWeb3 from "../util/getWeb3";

Vue.use(Vuex);
export const store = new Vuex.Store({
  strict: false,
  state,
  mutations: {
    registerWeb3Instance(state, payload) {
      // console.log("registerWeb3instance Mutation being executed", payload);
      let result = payload;
      let web3Copy = state.web3;
      // console.log(web3Copy)
      web3Copy.account = result.account;
      web3Copy.network = result.network;
      web3Copy.networkId = result.networkId;
      web3Copy.balance = parseInt(result.balance, 10);
      web3Copy.isInjected = result.injectedWeb3;
      web3Copy.web3Instance = result.web3;
      state.web3 = web3Copy;
    },
    ACCOUNT(state, payload) {
      state.event.address = payload;
    },
    CONTRACT(state, payload) {
      state.contract = payload;
    },
    EVENT(state, payload) {
      let result = payload;
      let eventCopy = state.event;
      eventCopy.eventName = ""+result.eventName;
      eventCopy.address = result.address.toLowerCase();
      eventCopy.balance = result.balance;
      eventCopy.target = 500000000000000000;
      eventCopy.signUpFee = result.signUpFee;
      eventCopy.recipientName = result.recipientName;
      eventCopy.recipientAddress = result.recipientAddress.toLowerCase();
      eventCopy.organiserAddress = result.organiserAddress.toLowerCase();
      eventCopy.participantCount = result.participantCount;
      eventCopy.recipientReceivedTotal = result.recipientReceivedTotal;
      eventCopy.pledgeCount = result.pledgeCount;
      eventCopy.stage = result.stage;
      state.event = eventCopy;
    },
    GASPRICE(state, payload) {
      state.gasPrice = parseInt(payload, 10);
    },
    PARTICIPANTS(state, participants) {
      state.participants = participants;
    },
  },
  actions: {
    registerWeb3({ commit }) {
      return getWeb3
        .then(result => {
          commit("registerWeb3Instance", result);
        })
        .catch(e => {
          console.log("error in action registerWeb3", e);
        });
    },
    async initContract({ commit, state }) {
      const SponsoredEventContract = await fetch("/static/contracts/SponsoredEvent.json")
                                            .then(res => res.json());
      const contract = TruffleContract(SponsoredEventContract);
      contract.setProvider(state.web3.web3Instance().currentProvider);

      commit("CONTRACT", contract);
    },
    async loadContract({ commit, state }, address) {
      const SponsoredEventContract = await fetch("/static/contracts/SponsoredEvent.json")
                                            .then(res => res.json());
      const contract = TruffleContract(SponsoredEventContract);
      contract.setProvider(state.web3.web3Instance().currentProvider);
      const instance = await contract.at(address);
      instance.allEvents()
        .on('data', (event) => {
          console.log(event);
        })
        .on('error', console.error);

      commit("CONTRACT", instance);
    },
    async loadGasPrice({ commit }) {
      const gasPrices = await fetch("https://ethgasstation.info/json/ethgasAPI.json")
                               .then(res => res.json());
      // The values from ethgasstation are in Gwei tenths
      // so to convert it to wei:
      // LowPrice = json.safeLow/10 * 1000000000
      commit("GASPRICE", web3.toWei(gasPrices.safeLow / 10, "gwei"));
    },
    async loadEvent({ commit, state }) {
      const contract = state.contract;
      const recipient = await contract.recipient();
      const organiser = await contract.organiser();
      const stage = await contract.closed() ? 'closed' : await contract.ended() ? 'ended' : 'open';
      commit("EVENT", {
        eventName: await contract.eventName(),
        address: contract.address,
        balance: await contract.getContractBalance(),
        signUpFee: await contract.signUpFee(),
        recipientName: recipient[0],
        recipientAddress: recipient[1],
        organiserAddress: organiser,
        participantCount: await contract.participantCount(),
        recipientReceivedTotal: await contract.recipientReceivedTotal(),
        pledgeCount: await contract.pledgeCount(),
        stage
      });
    },
    async loadParticipants({ commit, state }) {
      const contract = state.contract;
      const count = (await contract.participantCount()).toNumber();

      let participants = [];

      for (let i = 0; i < count; i++) {
        const participantAddress = await contract.participantsIndex(i);
        const participantDetails = await contract.participants(
          participantAddress
        );

        participants.push({
          id: i,
          name: participantDetails[0],
          address: participantDetails[1],
          status: participantDetails[2] ? "completed" : "not completed"
        });
      }
      commit("PARTICIPANTS", participants);
    },
  }
});
