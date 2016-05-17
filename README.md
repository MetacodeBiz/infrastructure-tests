# Test driven infrastructure

[![Build Status](https://travis-ci.org/wiktor-k/infrastructure-tests.svg?branch=master)](https://travis-ci.org/wiktor-k/infrastructure-tests)

This repository contains tests of the *metacode.biz* infrastructure.
These tests always ask external services to asses the state of the infrastructure

## Running tests

Running locally: `npm start`

Building and running through Docker:

    docker build -t metacode/infr . && docker run --rm -i metacode/infr

Or the same via npm alias: `npm run start-in-docker`

Putting the following script in `.git/hooks/pre-push` ensures that tests
pass locally before pushing them into the repository:

    #!/bin/bash

    npm run start-in-docker

Tests are executed on each commit to GitHub and additionally on schedule.

Testing the tests: `npm test`

## Test types

Currently tests cover:

  * HTTP/2 with [ALPN][ALPN],
  * IPv6 support,
  * [TLS configuration][SSLLABS].

See [`infr.ts`](infr.ts) for a complete list of supported tests.

[ALPN]: https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation
[SSLLABS]: https://www.ssllabs.com/ssltest/
