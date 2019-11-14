<template>
  <div>
    <div class="hello">
      <h1>Raise money for charitable causes</h1>
      <p>Manage the event using blockchain smart contracts</p>
      <div class="button"><router-link :to="'/create'">Start fundraising</router-link></div>
    </div>
    <div class="body">
      <p>Create and manage charity events through an Ethereum Smart Contract.</p>
      <p>Donations and sign-up fees are automatically kept in the contract until the event is over then they are transferred directly to the intended charity.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  mounted() {},
  data() {
    return {
      msg: "Raise money for charitable causes"
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    }
  },
  methods: {
    async connect() {
      // this is equivalent to ethereum.connect()
      this.$store.dispatch("registerWeb3");
    }
  }
};
</script>
<style>

</style>