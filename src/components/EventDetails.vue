<template>
  <div class="body">
    <div v-if="event && event.address">
      <div class="header">
        <div class="event-title">
          <h1>{{event.eventName}}</h1>
          <p>Fundraising for <strong>{{event.recipientName}}</strong></p>
          <router-link 
            :to="`/event/${event.address}/sign-up`"
            class="button"
            v-if="event.stage !== 'ended' && event.stage !== 'closed' "
            >Take part in this event</router-link>
        </div>
        <div class="summary">
          <div id="target-circle">
            <div class="percent-bg" :style="`height: ${Math.min(achievedPercent, 100)}%`"></div>
            <div class="percent-text">{{achievedPercent}}<span>%</span></div>
          </div>
          <h3>{{raised}} ETH</h3>
          <p>raised of <span>{{target}} ETH</span> target</p>
          <p>by <strong>{{supporterCount}} supporters</strong></p>
        </div>
      </div>
      <div class="content">
        <div v-if="event.stage === 'ended'">
          <p>This event has now ended. If you sponsored a participant who did not complete the event, you can reclaim your pledge.</p>
          <p>Fund that are not reclaimed within 1 week of the event will be transferred to <em>{{event.recipientName}}</em>.</p>
        </div>
        <div v-if="event.stage === 'closed'">
          <p>This event has now closed and all funds have been transferred to <em>{{event.recipientName}}</em>.</p>
        </div>
        <table 
          v-if="event.stage === 'open'"
          class="event-details">
          <caption><h2>Event details</h2></caption>
          <tr>
            <th>Event ID</th>
            <td>{{event.address}}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{{event.stage}}</td>
          </tr>
          <tr>
            <th>Sign-up Fee</th>
            <td>{{signUpFee}} ETH</td>
          </tr>
          <tr>
            <th>Recipient Name</th>
            <td>{{event.recipientName}}</td>
          </tr>
          <tr>
            <th>Recipient Address</th>
            <td>{{event.recipientAddress}}</td>
          </tr>
          <tr>
            <th>OrganiserId</th>
            <td>{{event.organiserAddress}}</td>
          </tr>
          <tr>
            <th>Number of participants</th>
            <td>{{event.participantCount}}</td>
          </tr>
          <tr>
            <th>Number of pledges</th>
            <td>{{event.pledgeCount}}</td>
          </tr>
        </table>
        <div class="sidebar">
          <div class="participants-list">
            <h2><router-link :to="`/event/${event.address}/participants`">Taking part</router-link></h2>
            <ul v-if="participants.length">
              <li v-for="participant in participants" :key="participant.address">
                <router-link
                  :to="`/event/${event.address}/participant/${participant.id}`"
                >
                  <jazzicon :address="participant.address" :diameter="40" class="icon"/>
                  {{ participant.name }}
                  <!-- <p>{{ participant.address }}</p> -->
                </router-link>
              </li>
            </ul>
            <p v-else>
              <router-link :to="`/event/${event.address}/sign-up`">Be the first to sign up!</router-link>
            </p>
          </div>
        </div>
      </div> 
      <AdminMenu />
    </div>
    <div v-else>
      <Loader :loading="loading" />
    </div>
  </div>
</template>

<script>
import AdminMenu from './AdminMenu';
import Loader from '@/components/Loader';
import { mapState } from 'vuex'

export default {
  name: "EventDetails",
  components: {
    AdminMenu,
    Loader,
  },
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadParticipants");
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      eventId: this.$route.params.eventId,
      contract: null,
    };
  },
  computed: {
    raised() {
      return web3.fromWei(this.event.balance.add(this.event.recipientReceivedTotal).toString(10), "ether");
    },
    target() {
      return web3.fromWei(this.event.target.toString(10), "ether");
    },
    achievedPercent() {
      return (this.raised/this.target) * 100;
    },
    supporterCount() {
      return parseInt(this.event.pledgeCount, 10) + parseInt(this.event.participantCount, 10);
    },
    signUpFee() {
      return web3.fromWei(this.event.signUpFee.toString(10), "ether");
    },
    ...mapState(['event', 'web3', 'participants']),
  },
  methods: {
  },
};
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  background: white;
  padding: 1rem;
  border-bottom: 1px solid lightgrey;
}
.event-title {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.event-title h1 {
  margin-top: 0 ;
  margin-bottom: 0;
  font-size: 2.5rem
}
.event-title p {
  margin-top: 0;  
}
.summary {
  text-align: center;
  width: 180px;
}
.summary h3 {
  margin: 0;
  padding: 0;
  font-size: 2rem
}
.summary p {
  margin: 0;
  padding: 0;
}
.summary span {
  font-weight: bold;
  color: #008E87;
}
.summary strong {
  white-space: nowrap;
}
#target-circle {
  margin: 0 auto;
    width: 150px;
    height: 150px;
    line-height: 150px;
    background: #008E87;
    border-radius: 50%;
    border: 8px solid #00B2A9;
    color: white;
    font-weight: bold;
    font-size: 3rem;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0px 0px 2px rgba(0,0,0,0.7);
}
.percent-bg {
    content: '';
    font-size: 2rem;
    position: absolute;
    bottom: -2px;
    left:-2px;
    right: -2px; 
    padding: 2px;
    background: #00B2A9;
    box-shadow: inset 1px 1px 1px rgba(0,0,0,0.7);
  }
.percent-text {
  position: absolute;
  width: 100%;
}
#target-circle span {
  font-size: 1.2rem;
  color: white;
}
.content {
  display: flex;
}
.event-details {
  flex: 2;
}
.participants-list {
  flex: 1;
  margin-left: 0;
}

.participants-list li {
  list-style: none;
  height: 40px;
  line-height: 40px;
}
.participants-list li a {
  display: flex;
}
.icon {
  margin-right:1rem;
}
.button {
  border: 8px solid #8a2291;
  background: #ac29b5;
  color: white;
  font-weight: bold;
  text-decoration: none;
  border-radius: 2rem;
  padding: 0.5rem 1rem;
    box-shadow:  0px 0px 2px rgba(0,0,0,0.7);
  width: 170px;   
}
.button:hover {
  opacity: 0.8;
}
</style>
