'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    port: 3000
});

// Start the server
server.register({
    register: require('../'),
    options: {
        validVersions: [1, 2],
        defaultVersion: 1,
        vendorName: 'mysuperapi'
    }
}, (err) => {

    if (err) {
        throw err;
    }

    // Add a route - handler is the same for all versions
    server.route({
        method: 'GET',
        path: '/version',
        handler: function (request, reply) {

            return reply({
                version: request.pre.apiVersion
            });
        }
    });

    // Add a versioned route - handler and maybe route defintion (think of validation) is different for versions
    server.route({
        method: 'GET',
        path: '/v1/users',
        handler: function (request, reply) {

            return reply([{
                name: 'Peter Miller'
            }]);
        }
    });

    server.route({
        method: 'GET',
        path: '/v2/users',
        handler: function (request, reply) {

            return reply([{
                firtname: 'Peter',
                lastname: 'Miller'
            }]);
        }
    });

    // Start the server
    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });

});
