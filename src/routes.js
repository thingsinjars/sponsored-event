const Joi = require('joi');
const Handlers = require('./handlers');

module.exports = [{
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: 'public'
    }
  }
}, {
  method: 'GET',
  path: '/',
  handler: {
    view: {
      template: 'index',
      context: {
        title: 'My home page'
      }
    }
  }
}, {
  method: 'GET',
  path: '/create',
  handler: {
    view: {
      template: 'create',
      context: {
        title: 'Create a Sponsored Event'
      }
    }
  }
}, {
  method: 'GET',
  path: '/event/{eventId}',
  handler: {
    view: {
      template: 'event',
      context: {
        title: 'Event details'
      }
    }
  }
}, {
  method: 'GET',
  path: '/event/{eventId}/sign-up',
  handler: {
    view: {
      template: 'sign-up',
      context: {
        title: 'Sign up for this event'
      }
    }
  }
}, {
  method: 'GET',
  path: '/event/{eventId}/participants',
  handler: {
    view: {
      template: 'participants',
      context: {
        title: 'All participants'
      }
    }
  }
}, {
  method: 'GET',
  path: '/event/{eventId}/participant/{participantId}',
  handler: {
    view: {
      template: 'participant',
      context: {
        title: 'Participant details'
      }
    }
  }
}, {
  method: 'GET',
  path: '/event/{eventId}/participant/{participantId}/pledge',
  handler: {
    view: {
      template: 'pledge',
      context: {
        title: 'Sponsor a participant'
      }
    }
  }
}, {
  method: 'GET',
  path: '/admin/{eventId}/participants',
  handler: {
    view: {
      template: 'admin-participants',
      context: {
        title: 'Admin participants'
      }
    }
  }
}, {
  method: 'GET',
  path: '/contracts/{param*}',
  handler: {
    directory: {
      path: 'build/contracts'
    }
  }
}];