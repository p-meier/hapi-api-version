'use strict';

const Hapi = require('hapi');
const Joi = require('joi');

const init = async function () {

    try {
        const server = new Hapi.server({ port: 3000 });
        await server.register({
            register: require('hapi-api-version'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 2,
                vendorName: 'mysuperapi'
            }
        });
        // Add a route - handler and route definition is the same for all versions
        server.route({
            method: 'GET',
            path: '/version',
            handler: function (request, reply) {

                // Return the api-version which was requested
                return reply({
                    version: request.pre.apiVersion
                });
            }
        });

        const usersVersion1 = [{
            name: 'Peter Miller'
        }];

        const usersVersion2 = [{
            firtname: 'Peter',
            lastname: 'Miller'
        }];

        // Add a versioned route - which is actually two routes with prefix '/v1' and '/v2'. Not only the
        // handlers are different, but also the route defintion itself (like here with response validation).
        server.route({
            method: 'GET',
            path: '/v1/users',
            handler: function (request, reply) {

                return reply(usersVersion1);
            },
            config: {
                response: {
                    schema: Joi.array().items(
                        Joi.object({
                            name: Joi.string().required()
                        })
                    )
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/v2/users',
            handler: function (request, reply) {

                return reply(usersVersion2);
            },
            config: {
                response: {
                    schema: Joi.array().items(
                        Joi.object({
                            firtname: Joi.string().required(),
                            lastname: Joi.string().required()
                        })
                    )
                }
            }

        });

        // Add a versioned route - This is a simple version of the '/users' route where just the handlers
        // differ and even those just a little. It maybe is the preferred option if just the formatting of
        // the response differs between versions.

        server.route({
            method: 'GET',
            path: '/users/simple',
            handler: function (request, reply) {

                const version = request.pre.apiVersion;

                if (version === 1) {
                    return reply(usersVersion1);
                }

                return reply(usersVersion2);
            }
        });
        // Start the server
        await server.start();
        console.log('Server running at:', server.info.uri);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    };
};
init();

