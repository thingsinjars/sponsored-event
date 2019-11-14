<template>
  <div class="body">
    <h1>{{ event.eventName }} participants</h1>
    <nav class="event-nav">
      <ul>
        <li v-if="event.stage === 'open'">
          <router-link :to="`/event/${event.address}/sign-up`"
            >Sign-up for this event</router-link
          >
        </li>
        <li>
          <router-link :to="`/event/${event.address}`"
            >Event details</router-link
          >
        </li>
      </ul>
    </nav>
    <div v-if="event.address" class="body">
      <ul>
        <li v-for="participant in participants" :key="participant.address">
          <router-link
            :to="`/event/${event.address}/participant/${participant.id}`"
          >
            <h3>{{ participant.name }}</h3>
            <p>{{ participant.address }}</p>
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else>
      Loading event from the blockchain
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "EventParticipants",
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadParticipants");
  },
  data() {
    return {
      msg: "Event participants",
      eventId: this.$route.params.eventId,
    };
  },
  computed: {
    ...mapState(['event', 'web3', 'participants']),
  },
};
</script>

