import { sslTest, dnssec, headers, caaRecordTags, dmarcSpf, certificateValidityDays } from './queries';

import isIPv6 = require('is-ipv6-node');

import fetch from 'node-fetch';

import test from 'ava';

const endpoints = sslTest({ host: 'metacode.biz' }).then(result => result.endpoints);

test('HTTPS endpoints must have high grades', async t => {
    t.true(
        (await endpoints).every(endpoint => endpoint.grade === 'A+'),
        'All endpoints must have grade A+.'
    );
});

test('ALPN support', async t => {
    t.true(
        (await endpoints).every(endpoint => endpoint.details.supportsAlpn),
        'All endpoints must support ALPN/H2.'
    );
});

test('IPv6 support', async t => {
    t.true(
        (await endpoints).some(endpoint => isIPv6(endpoint.ipAddress)),
        'Must have at least one IPv6 address.'
    );
});

test('TLS1.2/1.3 support', async t => {
    const allowedTlsVersions = ['1.2', '1.3'];
    t.true(
        (await endpoints).every(endpoint => endpoint.details.protocols.every(protocol =>
            protocol.name === 'TLS' && allowedTlsVersions.includes(protocol.version)
        )),
        'Must use only TLS with versions: ' + allowedTlsVersions
    );
});

test('DNSSEC support', async t=> {
    const result = await dnssec({ host: 'metacode.biz' });
    t.true(result.secure);
});

const headersResult = headers({ url: 'https://metacode.biz' });

test('Strict Transport Security', async t => {
    const sts = (await headersResult).get('strict-transport-security');
    if (!sts) {
        t.fail('STS header should be set.');
    } else {
        t.true('preload' in sts, 'STS must be preloaded');
        t.true('includeSubDomains' in sts, 'STS must include subdomains.');
        t.true(Number(sts['max-age']) >= 31536000, 'STS must be valid for long time.');
    }
});

test('X-XSS-Protection support', async t => {
    const xss = (await headersResult).get('x-xss-protection');
    if (!xss) {
        t.fail('XSS header should be set.');
    } else {
        t.true('1' in xss, 'XSS must be enabled.');
        t.is(xss['mode'], 'block', 'XSS must be in mode block.');
        t.true('report' in xss, 'XSS report url must be present.');
    }
});

test('X-Content-Type-Options support', async t => {
    const cto = (await headersResult).get('x-content-type-options');
    if (!cto) {
        t.fail('XCTO header should be set.');
    } else {
        t.true('nosniff' in cto, 'XCTO must be enabled.');
    }
});

test('X-Frame-Options support', async t => {
    const xfo = (await headersResult).get('x-frame-options');
    if (!xfo) {
        t.fail('XFO header should be set.');
    } else {
        t.true('DENY' in xfo, 'XFO must be enabled.');
    }
});

test('Bare domain and www subdomain responding', async t => {
    if (!(await fetch('https://metacode.biz')).ok) {
        t.fail('Fetching https://metacode.biz did not succeed.');
    } else if (!(await fetch('https://www.metacode.biz')).ok) {
        t.fail('Fetching https://www.metacode.biz did not succeed.');
    } else {
        t.pass('Ok!');
    }
});

test('CAA records support', async t => {
    const tags = await caaRecordTags({ hostname: 'metacode.biz' });
    t.true(tags.indexOf('issue') > -1);
    t.true(tags.indexOf('issuewild') > -1);
    t.true(tags.indexOf('iodef') > -1);
});

test('DMARC/SPF positive', async t => {
    t.true(await dmarcSpf({ hostname: 'metacode.biz' }));
});

test('Certificates will not expire in 2 weeks', async t => {
    const endpoints = [{
        hostname: 'metacode.biz',
        port: 443
    }, {
        hostname: 'metacode.biz',
        port: 5223
    }];
    for (const endpoint of endpoints) {
        const validityDays = await certificateValidityDays(endpoint);
        t.true(validityDays > 14, `Certificate for ${endpoint.hostname}:${endpoint.port} is valid only for ${validityDays} days.`);
    }
});
