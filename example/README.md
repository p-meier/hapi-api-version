# Testing the example project with curl

First start the server:

```
node example/index.js
```

### Get the default version (which is version 2 in this case)

```
curl localhost:3000/version
curl localhost:3000/users
```

### Get version 1 via `accept` header

```
curl -H "accept: application/vnd.mysuperapi.v1+json" localhost:3000/version
curl -H "accept: application/vnd.mysuperapi.v1+json" localhost:3000/users
```

### Get version 1 via `api-version` header

```
curl -H "api-version: 1" localhost:3000/version
curl -H "api-version: 1" localhost:3000/users
```
