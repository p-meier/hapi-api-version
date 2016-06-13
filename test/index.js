'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const expect = Code.expect;

const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;

let server;

beforeEach((done) => {

    server = new Hapi.Server();
    server.connection();

    done();
});

describe('Plugin registration', () => {

    it('should fail if no options are specified', (done) => {

        server.register({
            register: require('../'),
            options: {}
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if no validVersions are specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions is not an array', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: 1,
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions is an empty array', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if validVersions contains non integer values', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: ['1', 2.2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if no defaultVersion is specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an integer', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: '1',
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an element of validVersions', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if defaultVersion is not an element of validVersions', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if no vendorName is specified', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if vendorName is not a string', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should fail if passiveMode is not a boolean', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33,
                passiveMode: []
            }
        }, (err) => {

            if (err) {
                done();
            }
        });
    });

    it('should succeed if all required options are provided correctly', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }, (err) => {

            if (!err) {
                done();
            }
        });
    });

    it('should succeed if all options are provided correctly', (done) => {

        server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                versionHeader: 'myversion',
                passiveMode: true
            }
        }, (err) => {

            if (!err) {
                done();
            }
        });
    });
});

describe('Versioning', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        done();
    });

    describe(' -> basic versioning', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 1,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 2,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('returns version 2 if custom header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns version 2 if accept header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if no header is sent', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if custom header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': 'asdf'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/someinvalidapi.vasf+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header has an invalid vendor-name', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns a 400 if invalid api version is requested (not included in validVersions)', (done) => {

            server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '3'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(400);

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '1'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });
    });

    it('preserves query parameters after url-rewrite', (done) => {

        server.route({
            method: 'GET',
            path: '/v1/versionedWithParams',
            handler: function (request, reply) {

                const response = {
                    params: request.query
                };

                return reply(response);
            }
        });

        server.inject({
            method: 'GET',
            url: '/versionedWithParams?test=1'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.params).to.deep.equal({
                test: '1'
            });

            done();
        });
    });

    it('should work with CORS enabled', (done) => {

        server.route({
            method: 'GET',
            path: '/corstest',
            handler: function (request, reply) {

                return reply('Testing CORS!');
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        server.inject({
            method: 'OPTIONS',
            url: '/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.include({
                'access-control-allow-origin': 'http://www.example.com'
            });

            expect(response.headers).to.include('access-control-allow-methods');
            expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

            expect(response.headers).to.include('access-control-allow-headers');
            expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);

            done();
        });
    });

    describe(' -> path parameters', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/unversioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'versionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/unversioned/withPathParam/{unversionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.unversionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned/withPathParam/{versionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.versionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/multiSegment/{segment*2}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.segment
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned/optionalPathParam/{optional?}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.optional
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('resolves unversioned catch all routes', (done) => {

            server.inject({
                method: 'GET',
                url: '/unversioned/catch/all/route'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversionedCatchAll');

                done();
            });
        });

        it('resolves versioned catch all routes', (done) => {

            const apiVersion = 2;

            server.inject({
                method: 'GET',
                url: '/versioned/catch/all/route',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal('versionedCatchAll');

                done();
            });
        });

        it('resolves unversioned routes with path parameters', (done) => {

            const pathParam = '123456789';

            server.inject({
                method: 'GET',
                url: '/unversioned/withPathParam/' + pathParam
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves versioned routes with path parameters', (done) => {

            const pathParam = '123456789';
            const apiVersion = 1;

            server.inject({
                method: 'GET',
                url: '/versioned/withPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves multi segment path parameters', (done) => {

            const apiVersion = 2;
            const pathParam = 'multi/segment';

            server.inject({
                method: 'GET',
                url: '/versioned/multiSegment/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - without optional value', (done) => {

            const apiVersion = 2;
            const pathParam = undefined;

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - with optional value', (done) => {

            const apiVersion = 2;
            const pathParam = 'test';

            server.inject({
                method: 'GET',
                url: '/versioned/optionalPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });
    });
});

describe('Versioning with basePath', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                basePath: '/api/'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        done();
    });

    describe(' -> basic versioning', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/api/unversioned',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v1/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 1,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v2/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 2,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('returns version 2 if custom header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns version 2 if accept header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if no header is sent', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if custom header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'api-version': 'asdf'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'Accept': 'application/someinvalidapi.vasf+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header has an invalid vendor-name', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns a 400 if invalid api version is requested (not included in validVersions)', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/versioned',
                headers: {
                    'api-version': '3'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(400);

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/unversioned',
                headers: {
                    'api-version': '1'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/unversioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/unversioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });
    });

    it('preserves query parameters after url-rewrite', (done) => {

        server.route({
            method: 'GET',
            path: '/api/v1/versionedWithParams',
            handler: function (request, reply) {

                const response = {
                    params: request.query
                };

                return reply(response);
            }
        });

        server.inject({
            method: 'GET',
            url: '/api/versionedWithParams?test=1'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.params).to.deep.equal({
                test: '1'
            });

            done();
        });
    });

    it('should work with CORS enabled', (done) => {

        server.route({
            method: 'GET',
            path: '/api/corstest',
            handler: function (request, reply) {

                return reply('Testing CORS!');
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        server.inject({
            method: 'OPTIONS',
            url: '/api/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.include({
                'access-control-allow-origin': 'http://www.example.com'
            });

            expect(response.headers).to.include('access-control-allow-methods');
            expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

            expect(response.headers).to.include('access-control-allow-headers');
            expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);

            done();
        });
    });

    describe(' -> path parameters', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/api/unversioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v2/versioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'versionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/unversioned/withPathParam/{unversionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.unversionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v1/versioned/withPathParam/{versionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.versionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v2/versioned/multiSegment/{segment*2}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.segment
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/api/v2/versioned/optionalPathParam/{optional?}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.optional
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('resolves unversioned catch all routes', (done) => {

            server.inject({
                method: 'GET',
                url: '/api/unversioned/catch/all/route'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversionedCatchAll');

                done();
            });
        });

        it('resolves versioned catch all routes', (done) => {

            const apiVersion = 2;

            server.inject({
                method: 'GET',
                url: '/api/versioned/catch/all/route',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal('versionedCatchAll');

                done();
            });
        });

        it('resolves unversioned routes with path parameters', (done) => {

            const pathParam = '123456789';

            server.inject({
                method: 'GET',
                url: '/api/unversioned/withPathParam/' + pathParam
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves versioned routes with path parameters', (done) => {

            const pathParam = '123456789';
            const apiVersion = 1;

            server.inject({
                method: 'GET',
                url: '/api/versioned/withPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves multi segment path parameters', (done) => {

            const apiVersion = 2;
            const pathParam = 'multi/segment';

            server.inject({
                method: 'GET',
                url: '/api/versioned/multiSegment/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - without optional value', (done) => {

            const apiVersion = 2;
            const pathParam = undefined;

            server.inject({
                method: 'GET',
                url: '/api/versioned/optionalPathParam/',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - with optional value', (done) => {

            const apiVersion = 2;
            const pathParam = 'test';

            server.inject({
                method: 'GET',
                url: '/api/versioned/optionalPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });
    });
});

describe('Versioning with dynamic basePath', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                basePath: '/{tenant}/'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        done();
    });

    describe(' -> basic versioning', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/{tenant}/unversioned',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v1/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 1,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v2/versioned',
                handler: function (request, reply) {

                    const response = {
                        version: 2,
                        data: 'versioned'
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('returns version 2 if custom header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns version 2 if accept header is valid', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if no header is sent', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if custom header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'api-version': 'asdf'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header is invalid', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'Accept': 'application/someinvalidapi.vasf+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns default version if accept header has an invalid vendor-name', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.v2+json'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('versioned');

                done();
            });
        });

        it('returns a 400 if invalid api version is requested (not included in validVersions)', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned',
                headers: {
                    'api-version': '3'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(400);

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/unversioned',
                headers: {
                    'api-version': '1'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/unversioned',
                headers: {
                    'api-version': '2'
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(2);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/unversioned'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversioned');

                done();
            });
        });
    });

    it('preserves query parameters after url-rewrite', (done) => {

        server.route({
            method: 'GET',
            path: '/{tenant}/v1/versionedWithParams',
            handler: function (request, reply) {

                const response = {
                    params: request.query
                };

                return reply(response);
            }
        });

        server.inject({
            method: 'GET',
            url: '/tenant_id/versionedWithParams?test=1'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.params).to.deep.equal({
                test: '1'
            });

            done();
        });
    });

    it('should work with CORS enabled', (done) => {

        server.route({
            method: 'GET',
            path: '/{tenant}/corstest',
            handler: function (request, reply) {

                return reply('Testing CORS!');
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        server.inject({
            method: 'OPTIONS',
            url: '/tenant_id/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.headers).to.include({
                'access-control-allow-origin': 'http://www.example.com'
            });

            expect(response.headers).to.include('access-control-allow-methods');
            expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

            expect(response.headers).to.include('access-control-allow-headers');
            expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);

            done();
        });
    });

    describe(' -> path parameters', () => {

        beforeEach((done) => {

            server.route({
                method: 'GET',
                path: '/{tenant}/unversioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v2/versioned/{catchAll*}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'versionedCatchAll'
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/unversioned/withPathParam/{unversionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.unversionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v1/versioned/withPathParam/{versionedPathParam}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.versionedPathParam
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v2/versioned/multiSegment/{segment*2}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.segment
                    };

                    return reply(response);
                }
            });

            server.route({
                method: 'GET',
                path: '/{tenant}/v2/versioned/optionalPathParam/{optional?}',
                handler: function (request, reply) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: request.params.optional
                    };

                    return reply(response);
                }
            });

            done();
        });

        it('resolves unversioned catch all routes', (done) => {

            server.inject({
                method: 'GET',
                url: '/tenant_id/unversioned/catch/all/route'
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal('unversionedCatchAll');

                done();
            });
        });

        it('resolves versioned catch all routes', (done) => {

            const apiVersion = 2;

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned/catch/all/route',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal('versionedCatchAll');

                done();
            });
        });

        it('resolves unversioned routes with path parameters', (done) => {

            const pathParam = '123456789';

            server.inject({
                method: 'GET',
                url: '/tenant_id/unversioned/withPathParam/' + pathParam
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(1);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves versioned routes with path parameters', (done) => {

            const pathParam = '123456789';
            const apiVersion = 1;

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned/withPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves multi segment path parameters', (done) => {

            const apiVersion = 2;
            const pathParam = 'multi/segment';

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned/multiSegment/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - without optional value', (done) => {

            const apiVersion = 2;
            const pathParam = undefined;

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned/optionalPathParam/',
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });

        it('resolves optional path parameters - with optional value', (done) => {

            const apiVersion = 2;
            const pathParam = 'test';

            server.inject({
                method: 'GET',
                url: '/tenant_id/versioned/optionalPathParam/' + pathParam,
                headers: {
                    'api-version': apiVersion
                }
            }, (response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.version).to.equal(apiVersion);
                expect(response.result.data).to.equal(pathParam);

                done();
            });
        });
    });
});

describe('Versioning with passive mode', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                passiveMode: true
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        server.route({
            method: 'GET',
            path: '/unversioned',
            handler: function (request, reply) {

                const response = {
                    data: 'unversioned'
                };

                return reply(response);
            }
        });

        done();
    });

    it('returns no version if no header is supplied', (done) => {

        server.inject({
            method: 'GET',
            url: '/unversioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(undefined);
            expect(response.result.data).to.equal('unversioned');

            done();
        });
    });
});

describe('Add trailing slash for basePath if missing', () => {

    beforeEach((done) => {

        server.register([{
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                basePath: '/api'
            }
        }], (err) => {

            if (err) {
                return console.error('Can not register plugins', err);
            }
        });

        server.route({
            method: 'GET',
            path: '/api/v1/versioned',
            handler: function (request, reply) {

                const response = {
                    data: 'versioned'
                };

                return reply(response);
            }
        });

        done();
    });

    it('returns default version', (done) => {

        server.inject({
            method: 'GET',
            url: '/api/versioned'
        }, (response) => {

            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(undefined);
            expect(response.result.data).to.equal('versioned');

            done();
        });
    });
});
