const Hapi = require('hapi');

const config = require('./src/config');
const routes = require('./src/routes');

const server = Hapi.server({
  host: config.host || 'localhost',
  port: config.port || 9090
});

// Start the server
async function start() {

  try {
    await server.register(require('inert'));
    await server.register(require('vision'));
    server.views({
      engines: {
        html: require('handlebars')
      },
      relativeTo: __dirname,
      path: 'public/templates',
      partialsPath: 'public/templates/partials',
      layoutPath: 'public/templates/layout',
      layout: 'default'
    });
    server.route(routes);
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();