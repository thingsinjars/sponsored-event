import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import About from '@/components/About'
import Create from '@/components/Create'
import EventDetails from '@/components/EventDetails'
import EventParticipants from '@/components/EventParticipants'
import ParticipantDetails from '@/components/ParticipantDetails'
import Pledge from '@/components/Pledge'
import EventSignup from '@/components/EventSignup'
import AdminPage from '@/components/AdminPage'
import AdminParticipants from '@/components/AdminParticipants'
import AdminEnd from '@/components/AdminEnd'
import AdminClose from '@/components/AdminClose'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    }, {
      path: '/about',
      name: 'About',
      component: About
    }, {
      path: '/create',
      name: 'Create',
      component: Create
    }, {
      path: '/event/:eventId',
      name: 'Event',
      component: EventDetails
    }, {
      path: '/event/:eventId/participants',
      name: 'Participants',
      component: EventParticipants
    }, {
      path: '/event/:eventId/participant/:participantIndex',
      name: 'Participant details',
      component: ParticipantDetails
    }, {
      path: '/event/:eventId/participant/:participantIndex/pledge',
      name: 'Pledge',
      component: Pledge
    }, {
      path: '/event/:eventId/sign-up',
      name: 'Sign up',
      component: EventSignup
    }, {
      path: '/admin/:eventId',
      name: 'Admin page',
      component: AdminPage
    }, {
      path: '/admin/:eventId/participants',
      name: 'Admin Participants',
      component: AdminParticipants
    }, {
      path: '/admin/:eventId/end',
      name: 'Admin End',
      component: AdminEnd
    }, {
      path: '/admin/:eventId/close',
      name: 'Admin Close',
      component: AdminClose
    }]
})
