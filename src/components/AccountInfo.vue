<template>
  <div class="account-info">
    <ul v-if="web3.isInjected">
      <li><strong>Connected to</strong>: {{ web3.network }}</li>
      <li v-if="isMetamask"><strong>Connected using</strong>: Metamask</li>
    </ul>
    <ul v-if="web3.isInjected">
      <li><strong>Address</strong>: {{ web3.account }}</li>
      <li><strong>Balance</strong>: {{ ethBalance }} <strong>ETH</strong></li>
    </ul>
    <p v-else>Not connected to an ethereum network</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "AccountInfo",
  data() {
    return {
    };
  },
  computed: {
    ...mapState(['web3']),
    ethBalance() {
      return web3.fromWei(this.web3.balance, 'ether');
    },
    isMetamask() {
      return window.ethereum.isMetaMask;
    }
  },
};
</script>
<style>
.account-info {
  text-align: left;
  background: #2d4761;
  color: #fff;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.account-info p img {
  width: 40px;
  display: block;
}
.account-info ul {
  list-style: none;
  margin: 1em;
}
  
</style>