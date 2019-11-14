<template>
  <div class="body">
    <h1>{{ msg }}</h1>
    <form
      @submit.prevent="create">
      <div>
        <label for="eventName">Event Name</label>
        <input v-model="eventName">
      </div>
      <div>
        <label for="signUpFee">Sign-up fee (Ether)</label>
        <input type="number" v-model="signUpFee" step="0.01">
        <p class="small">The non-refundable fee charged to participants when they sign-up.</p>
      </div>
      <div>
        <label for="target">Fundraising target (Ether)</label>
        <input type="number" v-model="target" step="0.01">
        <p class="small">The amount you hope to raise through this event.</p>
      </div>
      <div class="form-group">
        <label for="recipientAddress">Recipient Address</label>
        <input type="text" v-model="recipientAddress" placeholder="Enter recipient address">
        <p class="small">This is the account of the recipient where funds will be sent after the event.</p>
      </div>
      <div class="form-group">
        <label for="recipientName">Recipient Name</label>
        <input type="text" v-model="recipientName" placeholder="Enter recipient name">
        <p class="small">The public name of the recipient.</p>
      </div>
      <button type="submit" class="obviousbutton">Create</button>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "Create",
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("initContract");
  },
  mounted() {
    if(!web3.isConnected) {
      this.$router.push("/login");
    }
  },
  data() {
    return {
      msg: "Create a new event",
      eventName: "Test Event",
      target: 0.5,
      signUpFee: 0.02,
      recipientAddress: "0x8Ce51fbE613a407CdBDAd59340085720e73b03De",
      recipientName: "Test Recipient Name"
    };
  },
  computed: {
    ...mapState(['contract', 'web3']),
  },
  methods: {
    create() {
      return this.$store.state.contract.new(
          this.eventName,
          web3.toWei(this.signUpFee, 'ether'),
          web3.toWei(this.target, 'ether'),
          this.recipientAddress,
          this.recipientName,
          {from: this.$store.state.web3.account}
        )
        .then(async result => {
          await this.$store.dispatch("loadContract", result.address);
          this.$router.push(`/event/${result.address}`)
        });
    }
  },
};
</script>

<style scoped>
label, input {
  font-size: 1.5rem;
}
label {
  margin-top: 2rem;
}
input {
  width: 40rem;
  border: none;
  border-bottom: 3px solid deeppink;
  color: grey;
}
</style>
