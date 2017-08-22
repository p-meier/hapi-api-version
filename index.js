'use strict';

const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('joi');
const MediaType = require('media-type');

const Package = require('./package');

const internals = {
    optionsSchema: Joi.object({
        validVersions: Joi.array().items(Joi.number().integer()).min(1).required(),
        defaultVersion: Joi.any().valid(Joi.ref('validVersions')).required(),
        vendorName: Joi.string().trim().min(1).required(),
        versionHeader: Joi.string().trim().min(1).default('api-version'),
        passiveMode: Joi.boolean().default(false),
        basePath: Joi.string().trim().min(1).default('/')
    })
};

const _extractVersionFromCustomHeader = function (request, options) {

    const apiVersionHeader = request.headers[options.versionHeader];

    if ((/^[0-9]+$/).test(apiVersionHeader)) {
        return parseInt(apiVersionHeader);
    }

    return null;
};

const _extractVersionFromAcceptHeader = function (request, options) {

    const acceptHeader = request.headers.accept;
    const media = MediaType.fromString(acceptHeader);

    if (media.isValid() && (/^vnd.[a-zA-Z0-9]+\.v[0-9]+$/).test(media.subtype)) {

        if (media.subtypeFacets[1] !== options.vendorName) {
            return null;
        }

        const version = media.subtypeFacets[2].replace('v', '');

        return parseInt(version);
    }

    return null;
};

//Set a response header containing the version number
const _addVersionToResponseHeader = function (request, reply, requestedVersion, options) {

    const headerName = options.versionHeader;
    const response = request.response;

    if (request.response.isBoom) {
        response.output.headers[headerName] = requestedVersion;
    }
    else {
        response.header(headerName, requestedVersion);
    }
    reply.continue();
};

exports.register = function (server, options, next) {

    const validateOptions = internals.optionsSchema.validate(options);

    if (validateOptions.error) {
        return next(validateOptions.error);
    }

    //Use the validated and maybe converted values from Joi
    options = validateOptions.value;

    server.ext('onRequest', (request, reply) => {

        //First check for custom header
        let requestedVersion = _extractVersionFromCustomHeader(request, options);

        //If no version check accept header
        if (typeof requestedVersion !== 'number') {
            requestedVersion = _extractVersionFromAcceptHeader(request, options);
        }

        //If passive mode skips the rest for non versioned routes
        if (options.passiveMode === true && typeof requestedVersion !== 'number') {
            return reply.continue();
        }

        //If there was a version by now check if it is valid
        if (typeof requestedVersion === 'number' && !Hoek.contain(options.validVersions, requestedVersion)) {
            return reply(Boom.badRequest('Invalid api-version! Valid values: ' + options.validVersions.join()));
        }

        //If there was no version by now use the default version
        if (typeof requestedVersion !== 'number') {
            requestedVersion = options.defaultVersion;
        }

        const versionedPath = options.basePath + 'v' + requestedVersion + request.path.slice(options.basePath.length - 1);

        const method = request.method === 'options' ? request.headers['access-control-request-method'] : request.method;

        const route = server.match(method, versionedPath);

        if (route && route.path.indexOf(options.basePath + 'v' + requestedVersion + '/') === 0) {
            request.setUrl(options.basePath + 'v' + requestedVersion + request.url.path.slice(options.basePath.length - 1)); //required to preserve query parameters
        }

        //Set version for usage in handler
        request.pre.apiVersion = requestedVersion;

        return reply.continue();
    });

    server.ext('onPreResponse', (request, reply) => {

        _addVersionToResponseHeader(request, reply, request.pre.apiVersion, options);
    });

    return next();
};

exports.register.attributes = {
    name: Package.name,
    version: Package.version
};
