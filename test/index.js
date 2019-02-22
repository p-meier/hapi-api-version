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

beforeEach(async () => {

    try {
        server = Hapi.server();
        await server.start();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});

describe('Plugin registration', () => {

    it('should throw error if no options are specified', (done) => {

        try {
            server.register({
                plugin: require('../'),
                options: {}
            }).then(() => {
            }).catch((e) => expect(e).to.be.an.instanceof(Error));
        }
        catch (e) {
            done();
        };
    });


    it('should fail if no options are specified', async () => {

        await expect(server.register({
            register: require('../'),
            options: {}
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if no validVersions are specified', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if validVersions is not an array', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: 1,
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);

    });

    it('should fail if validVersions is an empty array', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if validVersions contains non integer values', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: ['1', 2.2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if no defaultVersion is specified', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if defaultVersion is not an integer', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: '1',
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if defaultVersion is not an element of validVersions', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if defaultVersion is not an element of validVersions', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 3,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if no vendorName is specified', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if vendorName is not a string', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should fail if passiveMode is not a boolean', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 33,
                passiveMode: []
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should succeed if all required options are provided correctly', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        })).to.reject(Error, /Invalid plugin options/);
    });

    it('should succeed if all options are provided correctly', async () => {

        await expect(server.register({
            register: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                versionHeader: 'myversion',
                passiveMode: true
            }
        })).to.reject(Error, /Invalid plugin options/);
    });
});

describe('Versioning', () => {

    beforeEach(async () => {

        await server.register({
            plugin: require('../'),
            options: {
                validVersions: [0, 1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        });
    });

    describe(' -> basic versioning', () => {

        beforeEach(() => {

            server.route({
                method: 'GET',
                path: '/unversioned',
                handler: function (request, h) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'unversioned'
                    };

                    return response;
                }
            });

            server.route({
                method: 'GET',
                path: '/v0/versioned',
                handler: function (request, h) {

                    const response = {
                        version: 0,
                        data: 'versioned'
                    };

                    return response;
                }
            });

            server.route({
                method: 'GET',
                path: '/v1/versioned',
                handler: function (request, h) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'versioned'
                    };

                    return response;
                }
            });

            server.route({
                method: 'GET',
                path: '/v2/versioned',
                handler: function (request, h) {

                    const response = {
                        version: request.pre.apiVersion,
                        data: 'versioned'
                    };

                    return response;
                }
            });
        });

        it('returns version 2 if custom header is valid', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '2'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns version 0 if custom header is valid', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '0'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(0);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns version 2 if accept header is valid', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.mysuperapi.v2+json'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.data).to.equal('versioned');
        });

        it('sets pre.apiVersion properly', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/v2/versioned'
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns default version if no header is sent', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned'
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns default version response header if no request header is sent', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned'
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
            expect(response.headers['api-version']).to.equal(1);
        });

        it('returns version response header if response header is present', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '2'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.data).to.equal('versioned');
            expect(response.headers['api-version']).to.equal(2);
        });

        it('returns default version if custom header is invalid', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': 'asdf'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns default version if custom header is null', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': null
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns default version if accept header is invalid', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/someinvalidapi.vasf+json'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns default version if accept header has an invalid vendor-name', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'Accept': 'application/vnd.someinvalidapi.v2+json'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('versioned');
        });

        it('returns a 400 if invalid api version is requested (not included in validVersions)', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/versioned',
                headers: {
                    'api-version': '3'
                }
            });
            expect(response.statusCode).to.equal(400);
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 1', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '1'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('unversioned');
        });

        it('returns the same response for an unversioned route no matter what version is requested - version 2', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/unversioned',
                headers: {
                    'api-version': '2'
                }
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(2);
            expect(response.result.data).to.equal('unversioned');
        });

        it('returns the same response for an unversioned route no matter what version is requested - no version (=default)', async () => {

            const response = await server.inject({
                method: 'GET',
                url: '/unversioned'
            });
            expect(response.statusCode).to.equal(200);
            expect(response.result.version).to.equal(1);
            expect(response.result.data).to.equal('unversioned');
        });
    });

    it('preserves query parameters after url-rewrite', async () => {

        server.route({
            method: 'GET',
            path: '/v1/versionedWithParams',
            handler: function (request, h) {

                const response = {
                    params: request.query
                };

                return response;
            }
        });

        const response = await server.inject({
            method: 'GET',
            url: '/versionedWithParams?test=1'
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.params).to.equal({
            test: '1'
        });
    });

    it('should work with CORS enabled', async () => {

        server.route({
            method: 'GET',
            path: '/corstest',
            handler: function (request, h) {

                return 'Testing CORS!';
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        const response = await server.inject({
            method: 'OPTIONS',
            url: '/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'accept, authorization'
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.headers).to.include({
            'access-control-allow-origin': 'http://www.example.com'
        });

        expect(response.headers).to.include('access-control-allow-methods');
        expect(response.headers['access-control-allow-methods'].split(',')).to.include('GET');

        expect(response.headers).to.include('access-control-allow-headers');
        expect(response.headers['access-control-allow-headers'].split(',')).to.include(['Accept', 'Authorization']);
    });

    it('should 400 when an OPTIONS request has a malformed access-control-request-method header', async () => {

        server.route({
            method: 'GET',
            path: '/corstest',
            handler: function (request, h) {

                return 'Testing CORS!';
            },
            config: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization']
                }
            }
        });

        const response = await server.inject({
            method: 'OPTIONS',
            url: '/corstest',
            headers: {
                'Origin': 'http://www.example.com',
                'Access-Control-Request-Method': ''
            }
        });
        expect(response.statusCode).to.equal(400);
    });

    it('handles invalid request methods properly', async () => {

        const response = await server.inject({
            method: 'FAKE',
            url: '/route'
        });
        expect(response.statusCode).to.equal(404);
    });
});

describe(' -> vendor name ', () => {

    it('should accept non-alphanumeric characters', async () => {

        await server.register({
            plugin: require('../'),
            options: {
                validVersions: [0, 1, 2],
                defaultVersion: 1,
                vendorName: 'my.super-Api!'
            }
        });

        server.route({
            method: 'GET',
            path: '/v2/versioned',
            handler: function (request, h) {

                const response = {
                    version: 2,
                    data: 'versioned'
                };

                return response;
            }
        });

        const response = await server.inject({
            method: 'GET',
            url: '/versioned',
            headers: {
                'Accept': 'application/vnd.my.super-Api!.v2+json'
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(2);
        expect(response.result.data).to.equal('versioned');
    });

    it('should accept several period characters', async () => {

        await server.register({
            plugin: require('../'),
            options: {
                validVersions: [0, 1, 10],
                defaultVersion: 1,
                vendorName: 'company.departmanet.project.api'
            }
        });

        server.route({
            method: 'GET',
            path: '/v10/versioned',
            handler: function (request, h) {

                const response = {
                    version: 10,
                    data: 'versioned'
                };

                return response;
            }
        });

        const response = await server.inject({
            method: 'GET',
            url: '/versioned',
            headers: {
                'Accept': 'application/vnd.company.departmanet.project.api.v10+json'
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(10);
        expect(response.result.data).to.equal('versioned');
    });
});

describe(' -> path parameters', () => {

    beforeEach(async () => {

        await server.register({
            plugin: require('../'),
            options: {
                validVersions: [0, 1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi'
            }
        });
        server.route({
            method: 'GET',
            path: '/unversioned/{catchAll*}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: 'unversionedCatchAll'
                };

                return response;
            }
        });

        server.route({
            method: 'GET',
            path: '/v2/versioned/{catchAll*3}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: 'versionedCatchAll'
                };

                return response;
            }
        });


        server.route({
            method: 'GET',
            path: '/unversioned/withPathParam/{unversionedPathParam}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: request.params.unversionedPathParam
                };

                return response;
            }
        });

        server.route({
            method: 'GET',
            path: '/v1/versioned/withPathParam/{versionedPathParam}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: request.params.versionedPathParam
                };

                return response;
            }
        });

        server.route({
            method: 'GET',
            path: '/v2/versioned/multiSegment/{segment*2}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: request.params.segment
                };

                return response;
            }
        });

        server.route({
            method: 'GET',
            path: '/v2/versioned/optionalPathParam/{optional?}',
            handler: function (request, h) {

                const response = {
                    version: request.pre.apiVersion,
                    data: request.params.optional
                };

                return response;
            }
        });
    });

    it('resolves unversioned catch all routes', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/unversioned/catch/all/route'
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(1);
        expect(response.result.data).to.equal('unversionedCatchAll');
    });

    it('resolves versioned catch all routes', async () => {

        const apiVersion = 2;

        const response = await server.inject({
            method: 'GET',
            url: '/versioned/catch/all/route',
            headers: {
                'api-version': apiVersion
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(apiVersion);
        expect(response.result.data).to.equal('versionedCatchAll');
    });

    it('resolves unversioned routes with path parameters', async () => {

        const pathParam = '123456789';

        const response = await server.inject({
            method: 'GET',
            url: '/unversioned/withPathParam/' + pathParam
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(1);
        expect(response.result.data).to.equal(pathParam);
    });

    it('resolves versioned routes with path parameters', async () => {

        const pathParam = '123456789';
        const apiVersion = 1;

        const response = await server.inject({
            method: 'GET',
            url: '/versioned/withPathParam/' + pathParam,
            headers: {
                'api-version': apiVersion
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(apiVersion);
        expect(response.result.data).to.equal(pathParam);
    });

    it('resolves multi segment path parameters', async () => {

        const apiVersion = 2;
        const pathParam = 'multi/segment';

        const response = await server.inject({
            method: 'GET',
            url: '/versioned/multiSegment/' + pathParam,
            headers: {
                'api-version': apiVersion
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(apiVersion);
        expect(response.result.data).to.equal(pathParam);
    });

    it('resolves optional path parameters - without optional value', async () => {

        const apiVersion = 2;
        const pathParam = (server.version.indexOf('17.') > -1 ? '' : undefined);

        const response = await server.inject({
            method: 'GET',
            url: '/versioned/optionalPathParam/',
            headers: {
                'api-version': apiVersion
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(apiVersion);
        expect(response.result.data).to.equal(pathParam);
    });

    it('resolves optional path parameters - with optional value', async () => {

        const apiVersion = 2;
        const pathParam = 'test';

        const response = await server.inject({
            method: 'GET',
            url: '/versioned/optionalPathParam/' + pathParam,
            headers: {
                'api-version': apiVersion
            }
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(apiVersion);
        expect(response.result.data).to.equal(pathParam);
    });
});

describe('Versioning with passive mode', () => {

    beforeEach(async () => {

        await server.register({
            plugin: require('../'),
            options: {
                validVersions: [1, 2],
                defaultVersion: 1,
                vendorName: 'mysuperapi',
                passiveMode: true
            }
        });

        server.route({
            method: 'GET',
            path: '/unversioned',
            handler: function (request, h) {

                const response = {
                    data: 'unversioned'
                };

                return response;
            }
        });
    });

    it('returns no version if no header is supplied', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/unversioned'
        });
        expect(response.statusCode).to.equal(200);
        expect(response.result.version).to.equal(undefined);
        expect(response.result.data).to.equal('unversioned');
    });
});

