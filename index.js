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

    if (media.isValid() && (/^vnd.[a-z][a-z0-9.!#$&^_-]{0,126}\.v[0-9]+$/i).test(media.subtype)) {

        const vendorFacets = media.subtypeFacets.slice(1, media.subtypeFacets.length - 1);
        const vendorName = vendorFacets.join('.');

        if (vendorName !== options.vendorName) {
            return null;
        }

        const version = media.subtypeFacets[media.subtypeFacets.length - 1].slice(1);

        return parseInt(version);
    }

    return null;
};

//Set a response header containing the version number
const _addVersionToResponseHeader = function (request, requestedVersion, options) {

    const headerName = options.versionHeader;
    const response = request.response;

    if (request.response.isBoom) {
        response.output.headers[headerName] = requestedVersion;
    }
    else {
        response.header(headerName, requestedVersion);
    }
    return;
};

exports.name = Package.name;
exports.version = Package.version;

exports.register = (server, options) => {

    const validateOptions = internals.optionsSchema.validate(options);
    if (validateOptions.error) {
        throw new Error(validateOptions.error);
    }

    //Use the validated and maybe converted values from Joi
    options = validateOptions.value;

    server.ext('onRequest', (request, h) => {

        //First check for custom header
        let requestedVersion = _extractVersionFromCustomHeader(request, options);

        //If no version check accept header
        if (typeof requestedVersion !== 'number') {
            requestedVersion = _extractVersionFromAcceptHeader(request, options);
        }

        //If passive mode skips the rest for non versioned routes
        if (options.passiveMode === true && typeof requestedVersion !== 'number') {
            return h.continue;
        }

        //If there was a version by now check if it is valid
        if (typeof requestedVersion === 'number' && !Hoek.contain(options.validVersions, requestedVersion)) {
            return Boom.badRequest('Invalid api-version! Valid values: ' + options.validVersions.join());
        }

        //If there was no version by now use the default version
        if (typeof requestedVersion !== 'number') {
            requestedVersion = options.defaultVersion;
        }

        const versionedPath = options.basePath + 'v' + requestedVersion + request.path.slice(options.basePath.length - 1);

        let method = request.method;
        if (request.method === 'options') {
            method = request.headers['access-control-request-method'];
            if (!method) {
                throw Boom.badRequest('The Access-Control-Request-Method header must be set for CORS requests.');
            }
        }


        const route = server.match(method, versionedPath);

        if (route && route.path.indexOf(options.basePath + 'v' + requestedVersion + '/') === 0) {
            request.setUrl(options.basePath + 'v' + requestedVersion + request.url.path.slice(options.basePath.length - 1)); //required to preserve query parameters
        }

        //Set version for usage in handler
        request.pre.apiVersion = requestedVersion;

        return h.continue;
    });

    server.ext('onPreResponse', (request, h) => {

        _addVersionToResponseHeader(request, request.pre.apiVersion, options);
        return h.continue;
    });
};
