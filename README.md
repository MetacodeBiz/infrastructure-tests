# Test driven infrastructure

![Build Status](https://github.com/MetacodeBiz/infrastructure-tests/workflows/Docker%20Image%20CI/badge.svg)

This repository contains tests of the *metacode.biz* infrastructure.
These tests always ask external services to assess the state of the infrastructure.

## Running tests

Running locally: `npm test`

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
  * [TLS configuration][SSLLABS] with [modern TLS versions][TLSVER],
  * [DNSSEC configuration][DNSSEC],
  * [Security headers][SECH],
  * HTTPS responses on both zone apex and `www` subdomain,
  * no near certificate expiration dates,
  * [CAA records][CAA],
  * [DMARC][DMARC] and [SPF][SPF].

See [`queries.ts`](queries.ts) for a complete list of supported tests.

[ALPN]: https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation
[SSLLABS]: https://www.ssllabs.com/ssltest/
[DNSSEC]: https://www.icann.org/resources/pages/dnssec-qaa-2014-01-29-en
[SECH]: https://securityheaders.io/
[CAA]: https://en.wikipedia.org/wiki/DNS_Certification_Authority_Authorization
[DMARC]: https://dmarc.org/
[SPF]: https://en.wikipedia.org/wiki/Sender_Policy_Framework
[TLSVER]: https://www.zdnet.com/article/chrome-edge-ie-firefox-and-safari-to-disable-tls-1-0-and-tls-1-1-in-2020/
