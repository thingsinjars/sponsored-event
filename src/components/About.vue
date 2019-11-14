<template>
  <div class="body">
    <h1>GiveChain</h1>
    <p>Create and manage sponsored events through an Ethereum Smart Contract. Donations and sign-up fees are automatically kept in the contract until the event is over then they are transferred directly to the indended charity.</p>
    <h2>Event stages</h2>
    <p>Events go through the following lifecycle:</p>
    <ol>
      <li>Created<p>The event is open for registrations and people who have signed up can receive pledges from sponsors.</p></li>
      <li>Ended
        <p>The event has happened. The funds pledged to participants who completed the event are automatically transferred to the recipient.</p>
        <p>Anyone who sponsored a participant who <em>did not</em> complete the event can claim their pledge back.</p></li>
      <li>Closed<p>Any unclaimed funds are transferred to the recipient.</p></li>
    </ol>
    <h1>Fees</h1>
    <p>As all data is managed through a smart contract, fees are part of any transaction. These fees don't go to this contract but are paid to the ethereum miners.</p>
    <p>NOTE: These are a guideline. Live prices can change depending on the network conditions.</p>
    <ul>
      <li>Creating an event: 0.078 ETH (NOTE: this is too high. Working to bring this down)</li>
      <li>Signing up for an event: 0.00015 ETH</li>     
      <li>Pledging to a participant: 0.00015 ETH</li>     
      <li>Marking a participant as having completed the event: 0.00015 ETH</li>     
      <li>Ending the event: 0.00015 ETH</li>     
      <li>Closing the event: 0.00015 ETH</li>     
    </ul>
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