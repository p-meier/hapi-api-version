# hapi-api-version

[![Build Status](https://travis-ci.org/p-meier/hapi-api-version.svg?branch=master)](https://travis-ci.org/p-meier/hapi-api-version)

An API versioning plugin for [hapi](http://hapijs.com/).

## Features / Goals

- Supports versioning via `accept` and custom header (default `api-version`) as described on [troyhunt.com](http://www.troyhunt.com/2014/02/your-api-versioning-is-wrong-which-is.html)
- 100% test coverage
- Easy to use and flexible
- Follows the [hapi coding conventions](http://hapijs.com/styleguide)
- Allows to follow the DRY principle

## Requirements

Runs with Node >=4 and hapi >=10 which is tested with Travis CI.

## Installation

```
npm install --save hapi-api-version
```

## Usage

Register it with the server:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({
    port: 3000
});

server.register({
    register: require('hapi-api-version'),
    options: {
        validVersions: [1, 2],
        defaultVersion: 2,
        vendorName: 'mysuperapi'
    }
}, (err) => {

    //Add routes here...

    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });
});

```

Time to add some routes...

There are typically two common use cases which this plugin is designed to address.

#### Unversioned routes

This is the type of routes which never change regardless of the api version. The route definition and the handler stay the same.

```javascript
server.route({
    method: 'GET',
    path:'/loginStatus',
    handler: function (request, reply) {

        const loggedIn = ...;

        return reply({
          loggedIn: loggedIn
        });
    }
});
```

#### Versioned routes

This is the type of routes which actually change.

##### Handler only

In simple cases where just the handler differs you could use this approach.

```javascript
const usersVersion1 = [{
    name: 'Peter Miller'
}];

const usersVersion2 = [{
    firtname: 'Peter',
    lastname: 'Miller'
}];

server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {

        const version = request.pre.apiVersion;

        if (version === 1) {
            return reply(usersVersion1);
        }

        return reply(usersVersion2);
    }
});
```

##### Different route definitions per version

Sometimes it is required to change not just the handler but also the route definition itself.

```javascript
const usersVersion1 = [{
    name: 'Peter Miller'
}];

const usersVersion2 = [{
    firtname: 'Peter',
    lastname: 'Miller'
}];

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
```

Note the different schemas for response validation here.

The user still sends a request to `/users` and the plugin rewrites it internally to either `/v1/users` or `/v2/users` based on the requested version.

## Example

A complete working example with routes can be found in the `example` folder.

## Documentation

**hapi-api-version** works internally with rewriting urls. The process is very simple:

1. Check if an `accept` header OR a custom header (default `api-version`) is present and extract the version
2. If a version was extracted check if it is valid, otherwise respond with a status code `400`
3. If no version was extracted (e.g. no headers sent) use the default version
4. Check if a versioned route (like `/v2/users`) exists -> if so rewrite the url from `/users` to `/v2/users`, otherwise do nothing

### Options

The options for the plugin are validated on plugin registration.

- `validVersions` (required) is an array of integer values. Specifies all valid api versions you support. Anything else will be considered invalid and the plugin responds with a status code `400`.
- `defaultVersion` (required) is an integer that is included in `validVersions`. Defines which version to use if no headers are sent.
- `vendorName` (required) is a string. Defines the vendor name used in the `accept` header.
- `versionHeader` (optional) is a string. Defines the name of the custom header to use. Per default this is `api-version`.
- `passiveMode` (optional) is a boolean. Allows to bypass when no headers are supplied. Useful when you have serve other content like documentation and reduces overhead on processing those.

### Getting the requested API version in the handler

You can get the API version requested by the user (or maybe the default version if nothing was requested) in the handler. It is stored in `request.pre.apiVersion`.

### Headers

The headers must have a specific format to be correctly recognized and processed by the plugin.

##### Accept header

```
Accept: application/vnd.mysuperapi.v2+json
```

Here `mysuperapi` is what was specified in options as `vendorName`. If the vendor name does not match, the default version will be used instead.

##### Custom header

```
api-version: 2
```

Here `api-version` is the default name of the custom header. It can be specified in the options via `versionHeader`.

## Running the tests

[lab](https://github.com/hapijs/lab) is used for all tests. Make sure you install it globally before running the tests:

```
npm install -g lab
```

Now just execute the tests:

```
npm test
```

To see the coverage report in html just execute:

```
npm run test-coverage
```

After this the html report can be found in `coverage/coverage.html`.

## License

Apache-2.0
